const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  updateHackathonMultimedia,
  deleteHackathon,
  addParticipants,
  removeParticipants,
  getHackathonParticipants,
  toggleHackathonPublish,
  getHackathonMultimedia
} = require('../controllers/hackathonController');

// Public routes (for frontend to fetch hackathons and multimedia)
// Note: getAllHackathons uses optional authentication to determine admin vs student view
router.get('/', getAllHackathons);
router.get('/:id', getHackathonById);
router.get('/:id/multimedia', getHackathonMultimedia);

// Admin routes (require authentication and admin role)
router.use(authenticate); // All routes below require authentication

// Hackathon CRUD operations (admin only)
router.post('/', requireAdmin, createHackathon);
router.put('/:id', requireAdmin, updateHackathon);
router.delete('/:id', requireAdmin, deleteHackathon);

// Hackathon multimedia management (admin only)
router.put('/:id/multimedia', requireAdmin, updateHackathonMultimedia);

// Hackathon participants management (admin only)
router.post('/:id/participants', requireAdmin, addParticipants);
router.delete('/:id/participants', requireAdmin, removeParticipants);
router.get('/:id/participants', requireAdmin, getHackathonParticipants);

// Hackathon publish/unpublish (admin only)
router.put('/:id/publish', requireAdmin, toggleHackathonPublish);

module.exports = router;
