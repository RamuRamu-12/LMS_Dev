const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { Group, GroupMember, User, sequelize } = require('../models');

// Get all groups (admin only)
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['joined_at', 'is_leader', 'status']
          }
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(error);
  }
});

// Create a new group (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, max_members, student_ids = [] } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    // Check if group name already exists
    const existingGroup = await Group.findOne({
      where: { name: name.trim() }
    });

    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'A group with this name already exists'
      });
    }

    // Create the group
    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || null,
      max_members: max_members || null,
      created_by: req.user.id
    }, { transaction });

    // Add members if provided
    if (student_ids.length > 0) {
      // Validate student IDs
      const students = await User.findAll({
        where: {
          id: student_ids,
          role: 'student'
        }
      });

      if (students.length !== student_ids.length) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'One or more student IDs are invalid'
        });
      }

      // Create group members
      const groupMembers = student_ids.map((studentId, index) => ({
        group_id: group.id,
        student_id: studentId,
        is_leader: index === 0, // First student is leader
        added_by: req.user.id
      }));

      await GroupMember.bulkCreate(groupMembers, { transaction });

      // Update current_members count
      await group.update({
        current_members: student_ids.length
      }, { transaction });
    }

    await transaction.commit();

    // Fetch the created group with associations
    const createdGroup = await Group.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['joined_at', 'is_leader', 'status']
          }
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdGroup,
      message: 'Group created successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// Get a specific group (admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['joined_at', 'is_leader', 'status']
          }
        }
      ]
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
});

// Update a group (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, description, max_members, student_ids } = req.body;

    const group = await Group.findByPk(id);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Update group details
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (max_members !== undefined) updateData.max_members = max_members || null;

    await group.update(updateData, { transaction });

    // Update members if provided
    if (student_ids !== undefined) {
      // Remove existing members
      await GroupMember.destroy({
        where: { group_id: id },
        transaction
      });

      // Add new members
      if (student_ids.length > 0) {
        // Validate student IDs
        const students = await User.findAll({
          where: {
            id: student_ids,
            role: 'student'
          }
        });

        if (students.length !== student_ids.length) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'One or more student IDs are invalid'
          });
        }

        // Create group members
        const groupMembers = student_ids.map((studentId, index) => ({
          group_id: id,
          student_id: studentId,
          is_leader: index === 0, // First student is leader
          added_by: req.user.id
        }));

        await GroupMember.bulkCreate(groupMembers, { transaction });
      }

      // Update current_members count
      await group.update({
        current_members: student_ids.length
      }, { transaction });
    }

    await transaction.commit();

    // Fetch the updated group with associations
    const updatedGroup = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: {
            attributes: ['joined_at', 'is_leader', 'status']
          }
        }
      ]
    });

    res.json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// Delete a group (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const group = await Group.findByPk(id);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Delete group members first (cascade should handle this, but being explicit)
    await GroupMember.destroy({
      where: { group_id: id },
      transaction
    });

    // Delete the group
    await group.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
