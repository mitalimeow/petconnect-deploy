const express = require('express');
const router = express.Router();
const { submitApplication, getPendingApplications, approveApplication, denyApplication } = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Protected paths available to any logged in user
router.post('/', auth, submitApplication);

// Admin only paths
router.get('/admin/pending', auth, requireAdmin, getPendingApplications);
router.put('/admin/approve/:id', auth, requireAdmin, approveApplication);
router.put('/admin/deny/:id', auth, requireAdmin, denyApplication);

module.exports = router;
