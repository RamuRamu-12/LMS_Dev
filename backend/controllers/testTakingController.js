const { TestAttempt, TestAnswer, TestQuestion, TestQuestionOption, CourseTest, Course, Enrollment, ActivityLog } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Start a test attempt
 */
const startTest = async (req, res, next) => {
  try {
    const { testId } = req.params;

    // Check if test exists and is active
    const test = await CourseTest.findByPk(testId);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    if (!test.is_active) {
      throw new AppError('Test is not active', 400);
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: {
        student_id: req.user.id,
        course_id: test.course_id
      }
    });

    if (!enrollment) {
      throw new AppError('You are not enrolled in this course', 403);
    }

    // Check if student has completed all chapters (basic check)
    if (enrollment.progress < 100) {
      throw new AppError('You must complete all course chapters before taking the test', 400);
    }

    // Check attempt limits
    const existingAttempts = await TestAttempt.findAll({
      where: {
        student_id: req.user.id,
        test_id: testId
      }
    });

    // Check if user has already passed the test
    const hasPassed = existingAttempts.some(attempt => 
      attempt.status === 'completed' && attempt.score >= test.passing_score
    );

    if (hasPassed) {
      throw new AppError('You have already passed this test and received a certificate. No retakes allowed.', 400);
    }

    // Check if user has a certificate for this course (additional check)
    const { Certificate } = require('../models');
    const existingCertificate = await Certificate.findOne({
      where: {
        student_id: req.user.id,
        course_id: test.course_id
      }
    });

    if (existingCertificate) {
      throw new AppError('You have already received a certificate for this course. No retakes allowed.', 400);
    }

    if (test.max_attempts && existingAttempts.length >= test.max_attempts) {
      throw new AppError(`You have reached the maximum number of attempts (${test.max_attempts})`, 400);
    }

    // Check if there's an active attempt
    const activeAttempt = existingAttempts.find(attempt => attempt.status === 'in_progress');
    if (activeAttempt) {
      console.log('=== RESUME ATTEMPT DEBUG ===');
      console.log('Resuming attempt ID:', activeAttempt.id);
      console.log('Attempt status:', activeAttempt.status);
      console.log('Started at:', activeAttempt.started_at);
      console.log('============================');
      
      return res.json({
        success: true,
        message: 'Resuming existing test attempt',
        data: {
          attempt: activeAttempt.getPublicInfo()
        }
      });
    }

    // Create new attempt
    const attemptNumber = await TestAttempt.getNextAttemptNumber(req.user.id, testId);
    const attempt = await TestAttempt.create({
      test_id: testId,
      student_id: req.user.id,
      attempt_number: attemptNumber,
      status: 'in_progress',
      started_at: new Date()
    });

    console.log('=== NEW ATTEMPT DEBUG ===');
    console.log('Created attempt ID:', attempt.id);
    console.log('Attempt status:', attempt.status);
    console.log('Started at:', attempt.started_at);
    console.log('=========================');

    logger.info(`Test attempt started for user ${req.user.email}, test ${testId}`);

    res.status(201).json({
      success: true,
      message: 'Test attempt started successfully',
      data: {
        attempt: attempt.getPublicInfo(),
        test: test.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Start test error:', error);
    next(error);
  }
};

/**
 * Submit an answer for a question
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { question_id, answer_text } = req.body;

    if (!question_id) {
      throw new AppError('Question ID is required', 400);
    }

    // Check if attempt exists and is active
    const attempt = await TestAttempt.findByPk(attemptId);
    if (!attempt) {
      throw new AppError('Test attempt not found', 404);
    }

    if (attempt.student_id !== req.user.id) {
      throw new AppError('Unauthorized access to test attempt', 403);
    }

    if (attempt.status !== 'in_progress') {
      throw new AppError('Test attempt is not active', 400);
    }

    // Get the question
    const question = await TestQuestion.findByPk(question_id, {
      include: [
        {
          model: TestQuestionOption,
          as: 'options',
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if answer already exists
    let answer = await TestAnswer.findByAttemptAndQuestion(attemptId, question_id);

    if (answer) {
      // Update existing answer
      await answer.update({
        answer_text: answer_text || answer.answer_text
      });
    } else {
      // Create new answer
      answer = await TestAnswer.create({
        attempt_id: attemptId,
        question_id: question_id,
        answer_text: answer_text || '',
        is_correct: false, // Will be calculated when test is submitted
        points_earned: 0
      });
    }

    logger.info(`Answer submitted for question ${question_id} in attempt ${attemptId}`);

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        answer: answer.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Submit answer error:', error);
    next(error);
  }
};

/**
 * Submit the test (complete the attempt)
 */
const submitTest = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers: submittedAnswers } = req.body;

    // Check if attempt exists and is active
    const attempt = await TestAttempt.findByPk(attemptId);
    if (!attempt) {
      throw new AppError('Test attempt not found', 404);
    }

    console.log('=== SUBMIT TEST DEBUG ===');
    console.log('Attempt ID:', attemptId);
    console.log('Attempt status:', attempt.status);
    console.log('Student ID:', attempt.student_id);
    console.log('Request user ID:', req.user.id);
    console.log('Started at:', attempt.started_at);
    console.log('========================');

    if (attempt.student_id !== req.user.id) {
      throw new AppError('Unauthorized access to test attempt', 403);
    }

    if (attempt.status !== 'in_progress') {
      throw new AppError(`Test attempt is not active. Current status: ${attempt.status}`, 400);
    }

    // Get the test
    const test = await CourseTest.findByPk(attempt.test_id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Get all questions for the test with their options
    const questions = await TestQuestion.findAll({
      where: {
        test_id: attempt.test_id,
        is_active: true
      },
      include: [
        {
          model: TestQuestionOption,
          as: 'options',
          order: [['order', 'ASC']]
        }
      ],
      order: [['order', 'ASC']]
    });

    let totalPoints = 0;
    let earnedPoints = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // Process each question and create/update answers
    for (const question of questions) {
      totalPoints += question.points;

      const selectedOptionId = submittedAnswers[question.id];
      let isCorrect = false;
      let pointsEarned = 0;

      let selectedOption = null;
      if (selectedOptionId) {
        // Find the selected option
        selectedOption = question.options.find(opt => opt.id == selectedOptionId);
        
        if (selectedOption) {
          isCorrect = selectedOption.is_correct;
          if (isCorrect) {
            pointsEarned = question.points;
            earnedPoints += pointsEarned;
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        } else {
          incorrectAnswers++;
        }
      } else {
        incorrectAnswers++;
      }

      // Create or update the answer record
      let answer = await TestAnswer.findOne({
        where: {
          attempt_id: attemptId,
          question_id: question.id
        }
      });

      if (answer) {
        await answer.update({
          answer_text: selectedOption ? selectedOption.option_text : '',
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      } else {
        await TestAnswer.create({
          attempt_id: attemptId,
          question_id: question.id,
          answer_text: selectedOption ? selectedOption.option_text : '',
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      }
    }

    // Calculate final score
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = score >= test.passing_score;

    // Calculate time taken
    const timeTaken = Math.round((new Date() - new Date(attempt.started_at)) / 60000); // in minutes

    // Complete the attempt
    await attempt.update({
      score: score,
      total_points: totalPoints,
      earned_points: earnedPoints,
      time_taken_minutes: timeTaken,
      status: 'completed',
      completed_at: new Date()
    });

    // Update enrollment and create certificate if test is passed
    if (isPassed) {
      const enrollment = await Enrollment.findOne({
        where: {
          student_id: req.user.id,
          course_id: test.course_id
        }
      });

      if (enrollment) {
        await enrollment.update({
          test_passed: true,
          status: 'completed'
        });
      }

      // Auto-generate certificate for passing the test
      const { Certificate } = require('../models');
      
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        where: {
          student_id: req.user.id,
          course_id: test.course_id
        }
      });

      if (!existingCertificate) {
        // Generate certificate number and verification code
        const certificateNumber = await Certificate.generateCertificateNumber(req.user.id, test.course_id);
        const verificationCode = Certificate.generateVerificationCode();

        // Get course info for metadata
        const course = await Course.findByPk(test.course_id, {
          attributes: ['id', 'title', 'category', 'difficulty']
        });

        // Create certificate
        await Certificate.create({
          student_id: req.user.id,
          course_id: test.course_id,
          test_attempt_id: attemptId,
          certificate_number: certificateNumber,
          verification_code: verificationCode,
          issued_date: new Date(),
          is_valid: true,
          metadata: {
            courseName: course.title,
            studentName: req.user.name,
            score: Math.round(score),
            passingScore: test.passing_score,
            testTitle: test.title
          }
        });

        logger.info(`Certificate ${certificateNumber} automatically generated for student ${req.user.email} after passing test ${test.id}`);
      }
    }

    // Log test activity
    const activityType = isPassed ? 'test_passed' : 'test_attempted';
    const activityTitle = isPassed ? `Passed ${test.title}` : `Attempted ${test.title}`;
    const activityDescription = isPassed 
      ? `Passed ${test.title} with ${Math.round(score)}% score`
      : `Attempted ${test.title} with ${Math.round(score)}% score`;

    await ActivityLog.createActivity(
      req.user.id,
      activityType,
      activityTitle,
      activityDescription,
      {
        courseId: test.course_id,
        testId: test.id,
        metadata: {
          testTitle: test.title,
          score: Math.round(score),
          passingScore: test.passing_score,
          isPassed: isPassed,
          correctAnswers: correctAnswers,
          totalQuestions: questions.length,
          timeTaken: timeTaken
        },
        pointsEarned: isPassed ? 25 : 5
      }
    );

    logger.info(`Test attempt ${attemptId} completed by user ${req.user.email}. Score: ${score}%, Passed: ${isPassed}`);

    res.json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attempt: {
          ...attempt.getPublicInfo(),
          is_passed: isPassed,
          passing_score: test.passing_score
        },
        score: Math.round(score),
        total_points: totalPoints,
        earned_points: earnedPoints,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        is_passed: isPassed,
        time_taken_minutes: timeTaken
      }
    });
  } catch (error) {
    logger.error('Submit test error:', error);
    next(error);
  }
};

/**
 * Get test attempt details
 */
const getTestAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findByPk(attemptId, {
      include: [
        {
          model: CourseTest,
          as: 'test',
          attributes: ['id', 'title', 'description', 'passing_score', 'time_limit_minutes']
        }
      ]
    });

    if (!attempt) {
      throw new AppError('Test attempt not found', 404);
    }

    if (attempt.student_id !== req.user.id) {
      throw new AppError('Unauthorized access to test attempt', 403);
    }

    // Get answers for this attempt
    const answers = await TestAnswer.findByAttempt(attemptId);

    res.json({
      success: true,
      data: {
        attempt: {
          ...attempt.getPublicInfo(),
          test: attempt.test
        },
        answers: answers.map(answer => answer.getPublicInfo())
      }
    });
  } catch (error) {
    logger.error('Get test attempt error:', error);
    next(error);
  }
};

/**
 * Get student's test history
 */
const getTestHistory = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const attempts = await TestAttempt.findAll({
      where: {
        student_id: req.user.id,
        test_id: testId
      },
      include: [
        {
          model: CourseTest,
          as: 'test',
          attributes: ['id', 'title', 'passing_score']
        }
      ],
      order: [['attempt_number', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        attempts: attempts.map(attempt => ({
          ...attempt.getPublicInfo(),
          test: attempt.test,
          is_passed: attempt.score >= attempt.test.passing_score
        }))
      }
    });
  } catch (error) {
    logger.error('Get test history error:', error);
    next(error);
  }
};

/**
 * Get questions for a test (for taking the test)
 */
const getTestQuestions = async (req, res, next) => {
  try {
    const { testId } = req.params;

    // Check if test exists and is active
    const test = await CourseTest.findByPk(testId);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    if (!test.is_active) {
      throw new AppError('Test is not active', 400);
    }

    // Check if user has already passed the test
    const existingAttempts = await TestAttempt.findAll({
      where: {
        student_id: req.user.id,
        test_id: testId
      }
    });

    const hasPassed = existingAttempts.some(attempt => 
      attempt.status === 'completed' && attempt.score >= test.passing_score
    );

    if (hasPassed) {
      throw new AppError('You have already passed this test and received a certificate. No retakes allowed.', 400);
    }

    // Check if user has a certificate for this course
    const { Certificate } = require('../models');
    const existingCertificate = await Certificate.findOne({
      where: {
        student_id: req.user.id,
        course_id: test.course_id
      }
    });

    if (existingCertificate) {
      throw new AppError('You have already received a certificate for this course. No retakes allowed.', 400);
    }

    // First get questions
    const questions = await TestQuestion.findAll({
      where: { 
        test_id: testId,
        is_active: true 
      },
      order: [['order', 'ASC']]
    });

    // Then get options for each question (excluding correct answers for students)
    const formattedQuestions = await Promise.all(
      questions.map(async (question) => {
        const options = await TestQuestionOption.findAll({
          where: { question_id: question.id },
          order: [['order', 'ASC']]
        });
        
        return {
          ...question.getPublicInfo(),
          options: options.map(option => ({
            id: option.id,
            option_text: option.option_text,
            order: option.order
            // Note: is_correct is excluded for students
          }))
        };
      })
    );

    res.json({
      success: true,
      data: {
        test: test.getPublicInfo(),
        questions: formattedQuestions
      }
    });
  } catch (error) {
    logger.error('Get test questions error:', error);
    next(error);
  }
};

/**
 * Get user's test attempts
 */
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await TestAttempt.findAll({
      where: {
        student_id: req.user.id
      },
      include: [
        {
          model: CourseTest,
          as: 'test',
          attributes: ['id', 'title', 'passing_score']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Test attempts retrieved successfully',
      data: {
        attempts: attempts.map(attempt => attempt.getPublicInfo())
      }
    });
  } catch (error) {
    logger.error('Get my attempts error:', error);
    next(error);
  }
};

module.exports = {
  startTest,
  submitAnswer,
  submitTest,
  getTestAttempt,
  getTestHistory,
  getTestQuestions,
  getMyAttempts
};
