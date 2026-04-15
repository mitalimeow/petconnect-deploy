const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const auth = require('../middleware/auth');

router.get('/', adoptionController.getAdoptions);
router.post('/', auth, adoptionController.createAdoption);
router.get('/user/:userId', adoptionController.getAdoptionsByUser);
router.get('/:id', adoptionController.getAdoptionById);
router.delete('/:id', auth, adoptionController.deleteAdoption);

module.exports = router;
