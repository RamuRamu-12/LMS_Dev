const fs = require('fs');
const path = require('path');

// Migration templates for missing models
const migrations = {
  '013-create-course-tests.js': `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('course_tests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      passing_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 70
      },
      time_limit_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      max_attempts: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('course_tests', ['course_id']);
    await queryInterface.addIndex('course_tests', ['is_active']);
    await queryInterface.addIndex('course_tests', ['created_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('course_tests');
  }
};
`,

  '020-create-test-questions.js': `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_questions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      question_type: {
        type: Sequelize.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
        allowNull: false,
        defaultValue: 'multiple_choice'
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('test_questions', ['test_id']);
    await queryInterface.addIndex('test_questions', ['question_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_questions');
  }
};
`,

  '021-create-test-question-options.js': `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_question_options', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      option_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('test_question_options', ['question_id']);
    await queryInterface.addIndex('test_question_options', ['is_correct']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_question_options');
  }
};
`,

  '022-create-test-attempts.js': `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_attempts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_tests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      attempt_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      total_points: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      earned_points: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      passed: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'submitted', 'graded', 'abandoned'),
        allowNull: false,
        defaultValue: 'in_progress'
      },
      time_spent_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('test_attempts', ['test_id']);
    await queryInterface.addIndex('test_attempts', ['student_id']);
    await queryInterface.addIndex('test_attempts', ['status']);
    await queryInterface.addIndex('test_attempts', ['passed']);
    await queryInterface.addIndex('test_attempts', ['test_id', 'student_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_attempts');
  }
};
`,

  '023-create-test-answers.js': `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('test_answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_attempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'test_questions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      selected_option_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'test_question_options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      answer_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      points_earned: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('test_answers', ['attempt_id']);
    await queryInterface.addIndex('test_answers', ['question_id']);
    await queryInterface.addIndex('test_answers', ['selected_option_id']);
    await queryInterface.addIndex('test_answers', ['is_correct']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('test_answers');
  }
};
`,

  '024-create-certificates.js': `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('certificates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      test_attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'test_attempts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      certificate_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      issued_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      certificate_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      verification_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      is_valid: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('certificates', ['student_id']);
    await queryInterface.addIndex('certificates', ['course_id']);
    await queryInterface.addIndex('certificates', ['test_attempt_id']);
    await queryInterface.addIndex('certificates', ['certificate_number']);
    await queryInterface.addIndex('certificates', ['verification_code']);
    await queryInterface.addIndex('certificates', ['is_valid']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('certificates');
  }
};
`
};

// Create migration files
console.log('🚀 Generating missing migrations...\n');

const migrationsDir = path.join(__dirname, 'migrations');

Object.entries(migrations).forEach(([filename, content]) => {
  const filepath = path.join(migrationsDir, filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`⚠️  ${filename} already exists, skipping...`);
  } else {
    fs.writeFileSync(filepath, content);
    console.log(`✅ Created: ${filename}`);
  }
});

console.log('\n✨ Migration generation complete!\n');
console.log('📋 Summary:');
console.log('   - 013-create-course-tests.js');
console.log('   - 020-create-test-questions.js');
console.log('   - 021-create-test-question-options.js');
console.log('   - 022-create-test-attempts.js');
console.log('   - 023-create-test-answers.js');
console.log('   - 024-create-certificates.js');
console.log('\n💡 Next steps:');
console.log('   1. Review the generated migration files');
console.log('   2. Run: npm run db:migrate');
console.log('   3. Verify tables were created successfully\n');

