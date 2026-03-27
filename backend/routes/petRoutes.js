const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

// GET /api/pets (Advanced Filtering Endpoint)
router.get('/', petController.getPets);

// POST /api/pets/seed (Hidden testing endpoint to mock DB data quickly)
router.post('/seed', petController.seedPets);

module.exports = router;
