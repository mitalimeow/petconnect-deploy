const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// /api/profile
router.get('/me', auth, profileController.getMe);
router.put('/update', auth, profileController.updateProfile);
router.get('/search', profileController.searchUsers);
router.get('/:id', optionalAuth, profileController.getProfileById);
router.patch('/location', auth, profileController.updateTrueLocation);

module.exports = router;
