const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendRequest,
  cancelRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
  getIncomingRequests,
  getFriendshipStatus,
  getFriendsList
} = require('../controllers/friendController');

router.post('/friend-request/send', auth, sendRequest);
router.delete('/friend-request/cancel/:userId', auth, cancelRequest);
router.post('/friend-request/accept/:userId', auth, acceptRequest);
router.post('/friend-request/reject/:userId', auth, rejectRequest);
router.get('/friend-request/received', auth, getIncomingRequests);
router.delete('/friends/remove/:userId', auth, removeFriend);
router.get('/friendship-status/:userId', auth, getFriendshipStatus);
router.get('/friends/list', auth, getFriendsList);

module.exports = router;
