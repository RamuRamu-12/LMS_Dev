const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      freezeTableName: true
    },
    quoteIdentifiers: false
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Course = require('./Course')(sequelize, Sequelize.DataTypes);
const Enrollment = require('./Enrollment')(sequelize, Sequelize.DataTypes);
const FileUpload = require('./FileUpload')(sequelize, Sequelize.DataTypes);
const CourseChapter = require('./CourseChapter')(sequelize, Sequelize.DataTypes);
const ChapterProgress = require('./ChapterProgress')(sequelize, Sequelize.DataTypes);
const Project = require('./Project')(sequelize, Sequelize.DataTypes);
const Document = require('./Document')(sequelize, Sequelize.DataTypes);
const Video = require('./Video')(sequelize, Sequelize.DataTypes);
const ProjectPhase = require('./ProjectPhase')(sequelize, Sequelize.DataTypes);
const ProjectProgress = require('./ProjectProgress')(sequelize, Sequelize.DataTypes);
const CourseTest = require('./CourseTest')(sequelize, Sequelize.DataTypes);
const TestQuestion = require('./TestQuestion')(sequelize, Sequelize.DataTypes);
const TestQuestionOption = require('./TestQuestionOption')(sequelize, Sequelize.DataTypes);
const TestAttempt = require('./TestAttempt')(sequelize, Sequelize.DataTypes);
const TestAnswer = require('./TestAnswer')(sequelize, Sequelize.DataTypes);
const Certificate = require('./Certificate')(sequelize, Sequelize.DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, Sequelize.DataTypes);
const Achievement = require('./Achievement')(sequelize, Sequelize.DataTypes);
const Hackathon = require('./Hackathon')(sequelize, Sequelize.DataTypes);
const HackathonParticipant = require('./HackathonParticipant')(sequelize, Sequelize.DataTypes);
const HackathonGroup = require('./HackathonGroup')(sequelize, Sequelize.DataTypes);
const HackathonGroupMember = require('./HackathonGroupMember')(sequelize, Sequelize.DataTypes);
const Group = require('./Group')(sequelize, Sequelize.DataTypes);
const GroupMember = require('./GroupMember')(sequelize, Sequelize.DataTypes);

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Course, {
    foreignKey: 'instructor_id',
    as: 'courses',
    onDelete: 'CASCADE'
  });

  User.belongsToMany(Course, {
    through: Enrollment,
    foreignKey: 'student_id',
    otherKey: 'course_id',
    as: 'enrolledCourses'
  });

  // Course associations
  Course.belongsTo(User, {
    foreignKey: 'instructor_id',
    as: 'instructor'
  });

  Course.belongsToMany(User, {
    through: Enrollment,
    foreignKey: 'course_id',
    otherKey: 'student_id',
    as: 'students'
  });

  Course.hasMany(FileUpload, {
    foreignKey: 'course_id',
    as: 'files',
    onDelete: 'CASCADE'
  });


  Course.hasMany(CourseChapter, {
    foreignKey: 'course_id',
    as: 'chapters',
    onDelete: 'CASCADE'
  });

  Course.hasMany(Enrollment, {
    foreignKey: 'course_id',
    as: 'enrollments',
    onDelete: 'CASCADE'
  });

  // Enrollment associations
  Enrollment.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  Enrollment.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // FileUpload associations
  FileUpload.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // CourseChapter associations
  CourseChapter.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  CourseChapter.belongsTo(CourseTest, {
    foreignKey: 'test_id',
    as: 'test'
  });

  CourseChapter.hasMany(ChapterProgress, {
    foreignKey: 'chapter_id',
    as: 'progress',
    onDelete: 'CASCADE'
  });

  // ChapterProgress associations
  ChapterProgress.belongsTo(Enrollment, {
    foreignKey: 'enrollment_id',
    as: 'enrollment'
  });

  ChapterProgress.belongsTo(CourseChapter, {
    foreignKey: 'chapter_id',
    as: 'chapter'
  });

  // Enrollment has many ChapterProgress
  Enrollment.hasMany(ChapterProgress, {
    foreignKey: 'enrollment_id',
    as: 'chapterProgress',
    onDelete: 'CASCADE'
  });

  // Project associations
  Project.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
  
  Project.belongsTo(User, {
    foreignKey: 'updated_by',
    as: 'updater'
  });

  Project.hasMany(ProjectPhase, {
    foreignKey: 'projectId',
    as: 'projectPhases',
    onDelete: 'CASCADE'
  });

  Project.hasMany(ProjectProgress, {
    foreignKey: 'project_id',
    as: 'progress',
    onDelete: 'CASCADE'
  });

  Project.hasMany(Document, {
    foreignKey: 'project_id',
    as: 'documents',
    onDelete: 'CASCADE'
  });

  Project.hasMany(Video, {
    foreignKey: 'project_id',
    as: 'videos',
    onDelete: 'CASCADE'
  });

  // Document associations
  Document.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project'
  });
  
  Document.belongsTo(User, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
  });
  
  Document.belongsTo(User, {
    foreignKey: 'updated_by',
    as: 'updater'
  });

  // Video associations
  Video.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project'
  });
  
  Video.belongsTo(User, {
    foreignKey: 'uploaded_by',
    as: 'uploader'
  });
  
  Video.belongsTo(User, {
    foreignKey: 'updated_by',
    as: 'updater'
  });

  // ProjectPhase associations
  ProjectPhase.belongsTo(Project, {
    foreignKey: 'projectId',
    as: 'project'
  });

  ProjectPhase.hasMany(ProjectProgress, {
    foreignKey: 'phase_id',
    as: 'progress',
    onDelete: 'CASCADE'
  });

  // ProjectProgress associations
  ProjectProgress.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  ProjectProgress.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project'
  });

  ProjectProgress.belongsTo(ProjectPhase, {
    foreignKey: 'phase_id',
    as: 'phase'
  });

  // User has many ProjectProgress
  User.hasMany(ProjectProgress, {
    foreignKey: 'user_id',
    as: 'projectProgress',
    onDelete: 'CASCADE'
  });

  // Test system associations
  Course.hasMany(CourseTest, {
    foreignKey: 'course_id',
    as: 'tests',
    onDelete: 'CASCADE'
  });

  CourseTest.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  CourseTest.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  CourseTest.hasMany(TestQuestion, {
    foreignKey: 'test_id',
    as: 'questions',
    onDelete: 'CASCADE'
  });

  TestQuestion.belongsTo(CourseTest, {
    foreignKey: 'test_id',
    as: 'test'
  });

  TestQuestion.hasMany(TestQuestionOption, {
    foreignKey: 'question_id',
    as: 'options',
    onDelete: 'CASCADE'
  });

  TestQuestionOption.belongsTo(TestQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  CourseTest.hasMany(TestAttempt, {
    foreignKey: 'test_id',
    as: 'attempts',
    onDelete: 'CASCADE'
  });

  TestAttempt.belongsTo(CourseTest, {
    foreignKey: 'test_id',
    as: 'test'
  });

  TestAttempt.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  TestAttempt.hasMany(TestAnswer, {
    foreignKey: 'attempt_id',
    as: 'answers',
    onDelete: 'CASCADE'
  });

  TestAnswer.belongsTo(TestAttempt, {
    foreignKey: 'attempt_id',
    as: 'attempt'
  });

  TestAnswer.belongsTo(TestQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  User.hasMany(Certificate, {
    foreignKey: 'student_id',
    as: 'certificates',
    onDelete: 'CASCADE'
  });

  Certificate.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  Certificate.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  Certificate.belongsTo(TestAttempt, {
    foreignKey: 'test_attempt_id',
    as: 'testAttempt'
  });

  // ActivityLog associations
  User.hasMany(ActivityLog, {
    foreignKey: 'student_id',
    as: 'activities',
    onDelete: 'CASCADE'
  });

  ActivityLog.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  ActivityLog.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  ActivityLog.belongsTo(CourseChapter, {
    foreignKey: 'chapter_id',
    as: 'chapter'
  });

  ActivityLog.belongsTo(CourseTest, {
    foreignKey: 'test_id',
    as: 'test'
  });

  // Achievement associations
  User.hasMany(Achievement, {
    foreignKey: 'student_id',
    as: 'achievements',
    onDelete: 'CASCADE'
  });

  Achievement.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  Achievement.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course'
  });

  // Hackathon associations
  Hackathon.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
  
  Hackathon.belongsTo(User, {
    foreignKey: 'updated_by',
    as: 'updater'
  });

  Hackathon.belongsTo(User, {
    foreignKey: 'multimedia_uploaded_by',
    as: 'multimediaUploader'
  });

  Hackathon.belongsToMany(User, {
    through: HackathonParticipant,
    foreignKey: 'hackathon_id',
    otherKey: 'student_id',
    as: 'participants'
  });

  // HackathonParticipant associations
  HackathonParticipant.belongsTo(Hackathon, {
    foreignKey: 'hackathon_id',
    as: 'hackathon'
  });

  HackathonParticipant.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  User.belongsToMany(Hackathon, {
    through: HackathonParticipant,
    foreignKey: 'student_id',
    otherKey: 'hackathon_id',
    as: 'hackathons'
  });

  // HackathonGroup associations
  HackathonGroup.belongsTo(Hackathon, {
    foreignKey: 'hackathon_id',
    as: 'hackathon'
  });

  HackathonGroup.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  HackathonGroup.belongsToMany(User, {
    through: HackathonGroupMember,
    foreignKey: 'group_id',
    otherKey: 'student_id',
    as: 'members'
  });

  // HackathonGroupMember associations
  HackathonGroupMember.belongsTo(HackathonGroup, {
    foreignKey: 'group_id',
    as: 'group'
  });

  HackathonGroupMember.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  HackathonGroupMember.belongsTo(User, {
    foreignKey: 'added_by',
    as: 'addedBy'
  });

  // User associations for groups
  User.belongsToMany(HackathonGroup, {
    through: HackathonGroupMember,
    foreignKey: 'student_id',
    otherKey: 'group_id',
    as: 'hackathonGroups'
  });

  // Hackathon associations for groups
  Hackathon.hasMany(HackathonGroup, {
    foreignKey: 'hackathon_id',
    as: 'groups',
    onDelete: 'CASCADE'
  });

  // Group associations
  Group.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  Group.belongsToMany(User, {
    through: GroupMember,
    foreignKey: 'group_id',
    otherKey: 'student_id',
    as: 'members'
  });

  Group.belongsToMany(Hackathon, {
    through: HackathonGroup,
    foreignKey: 'group_id',
    otherKey: 'hackathon_id',
    as: 'hackathons'
  });

  // GroupMember associations
  GroupMember.belongsTo(Group, {
    foreignKey: 'group_id',
    as: 'group'
  });

  GroupMember.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  GroupMember.belongsTo(User, {
    foreignKey: 'added_by',
    as: 'addedBy'
  });

  // User associations for standalone groups
  User.belongsToMany(Group, {
    through: GroupMember,
    foreignKey: 'student_id',
    otherKey: 'group_id',
    as: 'groups'
  });

  User.hasMany(Group, {
    foreignKey: 'created_by',
    as: 'createdGroups',
    onDelete: 'CASCADE'
  });

};

// Define associations
defineAssociations();

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Course,
  Enrollment,
  FileUpload,
  CourseChapter,
  ChapterProgress,
  Project,
  Document,
  Video,
  ProjectPhase,
  ProjectProgress,
  CourseTest,
  TestQuestion,
  TestQuestionOption,
  TestAttempt,
  TestAnswer,
  Certificate,
  ActivityLog,
  Achievement,
  Hackathon,
  HackathonParticipant,
  HackathonGroup,
  HackathonGroupMember,
  Group,
  GroupMember
};
