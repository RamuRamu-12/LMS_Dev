const { CourseTest, TestQuestion, TestQuestionOption, TestAnswer, TestAttempt, Certificate, ActivityLog, Course, User } = require('../models');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get tests for a course
 */
const getTestsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const tests = await CourseTest.findAll({
      where: { 
        course_id: courseId,
        is_active: true 
      },
      order: [['order', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Tests retrieved successfully',
      data: {
        tests: tests.map(test => test.getPublicInfo())
      }
    });
  } catch (error) {
    logger.error('Get tests by course error:', error);
    next(error);
  }
};

/**
 * Get test by ID
 */
const getTestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await CourseTest.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!test) {
      throw new AppError('Test not found', 404);
    }

    res.json({
      success: true,
      message: 'Test retrieved successfully',
      data: {
        test: test.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Get test by ID error:', error);
    next(error);
  }
};

/**
 * Create a new test
 */
const createTest = async (req, res, next) => {
  try {
    const { 
      course_id, 
      title, 
      description, 
      passing_score, 
      time_limit_minutes, 
      max_attempts,
      instructions,
      order 
    } = req.body;

    // Verify course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const test = await CourseTest.create({
      course_id,
      title,
      description,
      passing_score: passing_score || 70,
      time_limit_minutes,
      max_attempts,
      instructions,
      order: order || 0,
      created_by: req.user.id,
      is_active: true
    });

    logger.info(`Test "${title}" created for course ${course_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: {
        test: test.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Create test error:', error);
    next(error);
  }
};

/**
 * Update a test
 */
const updateTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const test = await CourseTest.findByPk(id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    await test.update(updateData);

    logger.info(`Test ${id} updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: {
        test: test.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Update test error:', error);
    next(error);
  }
};

/**
 * Delete a test
 */
const deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await CourseTest.findByPk(id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Get all questions for this test
    const questions = await TestQuestion.findAll({
      where: { test_id: id }
    });

    // Delete all test answers for each question first
    for (const question of questions) {
      await TestAnswer.destroy({
        where: { question_id: question.id }
      });
    }

    // Delete all test attempts for this test
    const attempts = await TestAttempt.findAll({
      where: { test_id: id }
    });

    // Delete all certificates that reference these test attempts
    for (const attempt of attempts) {
      await Certificate.destroy({
        where: { test_attempt_id: attempt.id }
      });
    }

    // Delete all activity logs that reference this test
    await ActivityLog.destroy({
      where: { test_id: id }
    });

    // Now delete the test attempts
    await TestAttempt.destroy({
      where: { test_id: id }
    });

    // Now delete the test (this will cascade to questions and options)
    await test.destroy();

    logger.info(`Test ${id} deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    logger.error('Delete test error:', error);
    next(error);
  }
};

/**
 * Get questions for a test
 */
const getTestQuestions = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const test = await CourseTest.findByPk(testId);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // First get questions
    const questions = await TestQuestion.findAll({
      where: { 
        test_id: testId,
        is_active: true 
      },
      order: [['order', 'ASC']]
    });

    console.log('Raw questions found:', questions.length);

    // Then get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await TestQuestionOption.findAll({
          where: { question_id: question.id },
          order: [['order', 'ASC']]
        });
        
        console.log(`Question ${question.id} has ${options.length} options`);
        options.forEach((opt, index) => {
          console.log(`  Option ${index + 1}: "${opt.option_text}" (correct: ${opt.is_correct})`);
        });
        
        return {
          ...question.toJSON(),
          options: options.map(opt => ({
            id: opt.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            order: opt.order
          }))
        };
      })
    );

    console.log('=== GET QUESTIONS DEBUG ===');
    console.log('Questions found:', questionsWithOptions.length);
    questionsWithOptions.forEach((q, index) => {
      console.log(`Question ${index + 1}: ${q.question_text}`);
      console.log(`  Options: ${q.options ? q.options.length : 0}`);
      if (q.options) {
        q.options.forEach((opt, optIndex) => {
          console.log(`    Option ${optIndex + 1}: ${opt.option_text} (Correct: ${opt.is_correct})`);
        });
      }
    });
    console.log('===========================');

    res.json({
      success: true,
      message: 'Questions retrieved successfully',
      data: {
        test: test.getPublicInfo(),
        questions: questionsWithOptions
      }
    });
  } catch (error) {
    logger.error('Get test questions error:', error);
    next(error);
  }
};

/**
 * Create a question
 */
const createQuestion = async (req, res, next) => {
  try {
    const { 
      test_id, 
      question_text, 
      question_type, 
      points, 
      order,
      explanation,
      options = []
    } = req.body;

    console.log('=== CREATE QUESTION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Options received:', options);
    console.log('Question type:', question_type);
    console.log('Options length:', options ? options.length : 'undefined');
    console.log('Options details:', options ? options.map(opt => ({ 
      text: opt.option_text, 
      correct: opt.is_correct,
      raw: opt 
    })) : 'none');
    console.log('============================');

    const test = await CourseTest.findByPk(test_id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }

    // Validate options for multiple choice questions
    if (question_type === 'multiple_choice') {
      if (!options || options.length === 0) {
        throw new AppError('Multiple choice questions must have at least 2 options', 400);
      }
      
      const validOptions = options.filter(opt => opt.option_text && opt.option_text.trim() !== '');
      if (validOptions.length < 2) {
        throw new AppError('Multiple choice questions must have at least 2 valid options', 400);
      }
      
      const hasCorrectAnswer = validOptions.some(opt => opt.is_correct);
      if (!hasCorrectAnswer) {
        throw new AppError('At least one option must be marked as correct', 400);
      }
    }

    const question = await TestQuestion.create({
      test_id,
      question_text,
      question_type: question_type || 'multiple_choice',
      points: points || 1,
      order: order || 0,
      explanation,
      is_active: true
    });

    console.log('Question created with ID:', question.id);

    // Create options for multiple choice questions
    if (question_type === 'multiple_choice' && options && options.length > 0) {
      console.log('Creating options for question:', question.id);
      console.log('Options to create:', options);
      
      // Filter out empty options
      const validOptions = options.filter(opt => opt.option_text && opt.option_text.trim() !== '');
      console.log('Valid options after filtering:', validOptions);
      
      const optionPromises = validOptions.map((option, index) => {
        console.log(`Creating option ${index + 1}:`, option);
        console.log(`  - option_text: "${option.option_text}"`);
        console.log(`  - is_correct: ${option.is_correct}`);
        console.log(`  - trimmed: "${option.option_text.trim()}"`);
        
        return TestQuestionOption.create({
          question_id: question.id,
          option_text: option.option_text.trim(),
          is_correct: option.is_correct || false,
          order: index + 1
        });
      });
      
      const createdOptions = await Promise.all(optionPromises);
      console.log('Created options:', createdOptions.length);
      console.log('Created options details:', createdOptions.map(opt => ({ 
        id: opt.id, 
        text: opt.option_text, 
        correct: opt.is_correct,
        raw: opt.toJSON()
      })));
    } else {
      console.log('No options to create. Question type:', question_type, 'Options length:', options ? options.length : 'undefined');
    }

    // Fetch the question with options for response
    const questionWithOptions = await TestQuestion.findByPk(question.id, {
      include: [
        {
          model: TestQuestionOption,
          as: 'options',
          attributes: ['id', 'option_text', 'is_correct', 'order']
        }
      ]
    });

    logger.info(`Question created for test ${test_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        question: questionWithOptions.toJSON()
      }
    });
  } catch (error) {
    logger.error('Create question error:', error);
    next(error);
  }
};

/**
 * Update a question
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;

    const question = await TestQuestion.findByPk(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    await question.update(updateData);

    logger.info(`Question ${questionId} updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: {
        question: question.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Update question error:', error);
    next(error);
  }
};

/**
 * Delete a question
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await TestQuestion.findByPk(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Delete all test answers for this question first
    await TestAnswer.destroy({
      where: { question_id: questionId }
    });

    // Now delete the question (this will cascade to options)
    await question.destroy();

    logger.info(`Question ${questionId} deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    logger.error('Delete question error:', error);
    next(error);
  }
};

/**
 * Add option to question
 */
const addOption = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { option_text, is_correct, order } = req.body;

    const question = await TestQuestion.findByPk(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }

    const option = await TestQuestionOption.create({
      question_id: questionId,
      option_text,
      is_correct: is_correct || false,
      order: order || 0
    });

    logger.info(`Option added to question ${questionId} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Option added successfully',
      data: {
        option: option.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Add option error:', error);
    next(error);
  }
};

/**
 * Update option
 */
const updateOption = async (req, res, next) => {
  try {
    const { optionId } = req.params;
    const updateData = req.body;

    const option = await TestQuestionOption.findByPk(optionId);
    if (!option) {
      throw new AppError('Option not found', 404);
    }

    await option.update(updateData);

    logger.info(`Option ${optionId} updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Option updated successfully',
      data: {
        option: option.getPublicInfo()
      }
    });
  } catch (error) {
    logger.error('Update option error:', error);
    next(error);
  }
};

/**
 * Delete option
 */
const deleteOption = async (req, res, next) => {
  try {
    const { optionId } = req.params;

    const option = await TestQuestionOption.findByPk(optionId);
    if (!option) {
      throw new AppError('Option not found', 404);
    }

    await option.destroy();

    logger.info(`Option ${optionId} deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Option deleted successfully'
    });
  } catch (error) {
    logger.error('Delete option error:', error);
    next(error);
  }
};

module.exports = {
  getTestsByCourse,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getTestQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption
};
