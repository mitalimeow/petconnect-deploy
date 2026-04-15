const express = require('express');
const router = express.Router();
const lostPetController = require('../controllers/lostPetController');
const auth = require('../middleware/auth');

router.post('/', auth, lostPetController.createLostPet);
router.get('/', lostPetController.getAllLostPets);
router.get('/:id', lostPetController.getLostPetById);
router.get('/user/:userId', lostPetController.getLostPetsByUser);
router.delete('/:id', auth, lostPetController.deleteLostPet);

module.exports = router;
