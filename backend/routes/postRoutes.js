const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

router.get('/', auth, postController.getPosts);
router.post('/', auth, postController.createPost);
router.post('/:id/like', auth, postController.toggleLike);

module.exports = router;
