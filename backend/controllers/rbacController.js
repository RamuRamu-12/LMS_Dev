const { User, StudentPermission, sequelize } = require('../models');
const logger = require('../utils/logger');

// Get all student permissions
const getStudentPermissions = async (req, res) => {
  try {
    console.log('Fetching all student permissions');

    // Test database connection first
    await User.sequelize.authenticate();
    console.log('Database connection successful');

    // Test if StudentPermission table exists
    try {
      await StudentPermission.findOne({ limit: 1 });
      console.log('StudentPermission table exists');
    } catch (tableError) {
      console.log('StudentPermission table does not exist or has issues:', tableError.message);
      // Return empty permissions if table doesn't exist
      return res.json({
        success: true,
        data: {},
        message: 'StudentPermission table not found - using default permissions'
      });
    }

    // Get all students with their permissions
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'avatar'],
      include: [
        {
          model: StudentPermission,
          as: 'permissions',
          attributes: ['courses', 'hackathons', 'realtime_projects'],
          required: false
        }
      ]
    });

    console.log(`Found ${students.length} students`);
    students.forEach(student => {
      console.log(`Student ${student.id} (${student.name}): permissions =`, student.permissions);
    });

    // Format permissions for frontend
    const permissions = {};
    students.forEach(student => {
      if (student.permissions && student.permissions.dataValues) {
        // Student has existing permissions
        const studentPerms = student.permissions.dataValues;
        permissions[student.id] = {
          courses: studentPerms.courses,
          hackathons: studentPerms.hackathons,
          realtimeProjects: studentPerms.realtime_projects
        };
      } else {
        // Student doesn't have permissions yet - use defaults
        permissions[student.id] = {
          courses: true, // Default access to courses
          hackathons: false,
          realtimeProjects: false
        };
      }
    });

    console.log('Returning permissions to frontend:', permissions);

    res.json({
      success: true,
      data: permissions,
      message: 'Student permissions retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching student permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student permissions',
      error: error?.message || 'Unknown error'
    });
  }
};

// Update student permissions (bulk update)
const updateStudentPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid permissions data'
      });
    }

    console.log('Updating student permissions in bulk');
    console.log('Received permissions data:', JSON.stringify(permissions, null, 2));
    console.log('Number of permission objects to process:', Object.keys(permissions).length);

    // Use database transaction to ensure all updates are committed
    const result = await sequelize.transaction(async (t) => {
      const updatePromises = Object.entries(permissions).map(async ([studentId, studentPermissions]) => {
      try {
        // Check if student exists
        const student = await User.findOne({
          where: { 
            id: studentId,
            role: 'student' 
          },
          transaction: t
        });

        if (!student) {
          console.warn(`Student with ID ${studentId} not found`);
          return;
        }

        // Skip if studentPermissions is empty or has no valid values
        if (!studentPermissions || 
            (studentPermissions.courses === undefined && 
             studentPermissions.hackathons === undefined && 
             studentPermissions.realtimeProjects === undefined)) {
          console.log(`Skipping student ${studentId} - no permission values provided`);
          return;
        }

        // Find or create permission record
        const [permission, created] = await StudentPermission.findOrCreate({
          where: { student_id: studentId },
          defaults: {
            student_id: studentId,
            courses: studentPermissions.courses !== undefined ? studentPermissions.courses : true,
            hackathons: studentPermissions.hackathons !== undefined ? studentPermissions.hackathons : false,
            realtime_projects: studentPermissions.realtimeProjects !== undefined ? studentPermissions.realtimeProjects : false
          },
          transaction: t
        });

        if (!created) {
          // Update existing permission - force update with provided values
          const updateData = {
            courses: studentPermissions.courses,
            hackathons: studentPermissions.hackathons,
            realtime_projects: studentPermissions.realtimeProjects
          };
          
          console.log(`Student ${studentId} - Update data prepared:`, updateData);
          console.log(`Student ${studentId} - Current permission values:`, {
            courses: permission.courses,
            hackathons: permission.hackathons,
            realtime_projects: permission.realtime_projects
          });
          
          // Force update with the provided data
          console.log(`Updating student ${studentId} with data:`, updateData);
          console.log(`Current permission record before update:`, {
            id: permission.id,
            student_id: permission.student_id,
            courses: permission.courses,
            hackathons: permission.hackathons,
            realtime_projects: permission.realtime_projects
          });
          
          await permission.update(updateData, { transaction: t });
          
          // Reload the permission to verify the update
          await permission.reload({ transaction: t });
          
          console.log(`✅ Successfully updated permissions for student ${studentId}`);
          console.log(`Permission record after update:`, {
            id: permission.id,
            student_id: permission.student_id,
            courses: permission.courses,
            hackathons: permission.hackathons,
            realtime_projects: permission.realtime_projects
          });
        } else {
          console.log(`✅ Created new permission record for student ${studentId}`);
        }

        console.log(`Final permissions for student ${studentId}:`, {
          courses: permission.courses,
          hackathons: permission.hackathons,
          realtime_projects: permission.realtime_projects
        });
      } catch (error) {
        console.error(`Error updating permissions for student ${studentId}:`, error);
        throw error;
      }
    });

      await Promise.all(updatePromises);
      
      // Final verification - check if updates were actually committed
      console.log('🔍 Verifying updates were committed...');
      for (const [studentId] of Object.entries(permissions)) {
        const verification = await StudentPermission.findOne({
          where: { student_id: studentId },
          transaction: t
        });
        if (verification) {
          console.log(`✅ Verified student ${studentId} permissions:`, {
            courses: verification.courses,
            hackathons: verification.hackathons,
            realtime_projects: verification.realtime_projects
          });
        }
      }
      
      return true; // Transaction successful
    });

    console.log('✅ Database transaction completed successfully');
    console.log('🎉 All permission updates have been committed to the database');

  res.json({
    success: true,
    message: 'Student permissions updated successfully'
  });

  } catch (error) {
    console.error('Error updating student permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student permissions',
      error: error?.message || 'Unknown error'
    });
  }
};

// Get permissions for a specific student
const getStudentPermission = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log(`Fetching permissions for student ${studentId}`);

    // Check if student exists
    const student = await User.findOne({
      where: { 
        id: studentId,
        role: 'student' 
      },
      attributes: ['id', 'name', 'email', 'avatar']
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student permissions
    const permission = await StudentPermission.findOne({
      where: { student_id: studentId }
    });

    const permissions = permission ? {
      courses: permission.courses,
      hackathons: permission.hackathons,
      realtimeProjects: permission.realtime_projects
    } : {
      courses: true, // Default access to courses
      hackathons: false,
      realtimeProjects: false
    };

    res.json({
      success: true,
      data: {
        student,
        permissions
      },
      message: 'Student permissions retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching student permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student permission',
      error: error?.message || 'Unknown error'
    });
  }
};

// Update permissions for a specific student
const updateStudentPermission = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courses, hackathons, realtimeProjects } = req.body;

    console.log(`Updating permissions for student ${studentId}`);

    // Check if student exists
    const student = await User.findOne({
      where: { 
        id: studentId,
        role: 'student' 
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find or create permission record
    const [permission, created] = await StudentPermission.findOrCreate({
      where: { student_id: studentId },
      defaults: {
        student_id: studentId,
        courses: courses !== undefined ? courses : true,
        hackathons: hackathons !== undefined ? hackathons : false,
        realtime_projects: realtimeProjects !== undefined ? realtimeProjects : false
      }
    });

    if (!created) {
      // Update existing permission
      await permission.update({
        courses: courses !== undefined ? courses : permission.courses,
        hackathons: hackathons !== undefined ? hackathons : permission.hackathons,
        realtime_projects: realtimeProjects !== undefined ? realtimeProjects : permission.realtime_projects
      });
    }

    res.json({
      success: true,
      data: {
        courses: permission.courses,
        hackathons: permission.hackathons,
        realtimeProjects: permission.realtime_projects
      },
      message: 'Student permissions updated successfully'
    });

  } catch (error) {
    console.error('Error updating student permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student permission',
      error: error?.message || 'Unknown error'
    });
  }
};

// Check if student has access to a specific feature
const checkStudentAccess = async (req, res) => {
  try {
    const { studentId, feature } = req.params;

    // Validate feature
    const validFeatures = ['courses', 'hackathons', 'realtimeProjects'];
    if (!validFeatures.includes(feature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feature specified'
      });
    }

    console.log(`Checking ${feature} access for student ${studentId}`);

    // Check if student exists
    const student = await User.findOne({
      where: { 
        id: studentId,
        role: 'student' 
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student permissions
    const permission = await StudentPermission.findOne({
      where: { student_id: studentId }
    });

    // Default permissions
    const defaultPermissions = {
      courses: true,
      hackathons: false,
      realtimeProjects: false
    };

    // Map feature names to database field names
    const featureMap = {
      courses: 'courses',
      hackathons: 'hackathons',
      realtimeProjects: 'realtime_projects'
    };

    const dbField = featureMap[feature];
    const hasAccess = permission ? permission[dbField] : defaultPermissions[feature];

    res.json({
      success: true,
      data: {
        hasAccess,
        feature,
        studentId
      },
      message: hasAccess ? 'Student has access to this feature' : 'Student does not have access to this feature'
    });

  } catch (error) {
    console.error('Error checking student access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check student access',
      error: error?.message || 'Unknown error'
    });
  }
};

// Get current user's permissions (for students to check their own permissions)
const getMyPermissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`Fetching permissions for current user ${userId} (role: ${userRole})`);

    // If user is admin, they have access to everything
    if (userRole === 'admin') {
      return res.json({
        success: true,
        data: {
          permissions: {
            courses: true,
            hackathons: true,
            realtimeProjects: true
          }
        },
        message: 'Admin permissions retrieved successfully'
      });
    }

    // For students, get their specific permissions
    if (userRole === 'student') {
      // Get student permissions
      const permission = await StudentPermission.findOne({
        where: { student_id: userId }
      });

      const permissions = permission ? {
        courses: permission.courses,
        hackathons: permission.hackathons,
        realtimeProjects: permission.realtime_projects
      } : {
        courses: true, // Default access to courses
        hackathons: false,
        realtimeProjects: false
      };

      return res.json({
        success: true,
        data: {
          permissions
        },
        message: 'Student permissions retrieved successfully'
      });
    }

    // For other roles, deny access
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });

  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions',
      error: error?.message || 'Unknown error'
    });
  }
};

module.exports = {
  getStudentPermissions,
  updateStudentPermissions,
  getStudentPermission,
  updateStudentPermission,
  checkStudentAccess,
  getMyPermissions
};
