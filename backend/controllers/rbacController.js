const { User, StudentPermission } = require('../models');
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

    // Format permissions for frontend
    const permissions = {};
    students.forEach(student => {
      const studentPerms = student.permissions?.[0] || {
        courses: true, // Default access to courses
        hackathons: false,
        realtime_projects: false
      };
      
      permissions[student.id] = {
        courses: studentPerms.courses,
        hackathons: studentPerms.hackathons,
        realtimeProjects: studentPerms.realtime_projects
      };
    });

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

    const updatePromises = Object.entries(permissions).map(async ([studentId, studentPermissions]) => {
      try {
        // Check if student exists
        const student = await User.findOne({
          where: { 
            id: studentId,
            role: 'student' 
          }
        });

        if (!student) {
          console.warn(`Student with ID ${studentId} not found`);
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
          }
        });

        if (!created) {
          // Update existing permission
          await permission.update({
            courses: studentPermissions.courses !== undefined ? studentPermissions.courses : permission.courses,
            hackathons: studentPermissions.hackathons !== undefined ? studentPermissions.hackathons : permission.hackathons,
            realtime_projects: studentPermissions.realtimeProjects !== undefined ? studentPermissions.realtimeProjects : permission.realtime_projects
          });
        }

        console.log(`Updated permissions for student ${studentId}:`, studentPermissions);
      } catch (error) {
        console.error(`Error updating permissions for student ${studentId}:`, error);
        throw error;
      }
    });

    await Promise.all(updatePromises);

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
