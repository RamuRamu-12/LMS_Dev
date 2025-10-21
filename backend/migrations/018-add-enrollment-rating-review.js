'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 003-create-enrollments.js
    // The rating and review columns are already created in the main enrollments migration
    console.log('018-add-enrollment-rating-review: Skipped - consolidated into 003-create-enrollments.js');
  },

  down: async (queryInterface, Sequelize) => {
    // This migration is now consolidated into 003-create-enrollments.js
    // Tables are managed by the main enrollments migration
    console.log('018-add-enrollment-rating-review: Skipped - consolidated into 003-create-enrollments.js');
  }
};
