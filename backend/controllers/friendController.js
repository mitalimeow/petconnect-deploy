const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// 1. sendRequest: POST /friend-request/send
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) return res.status(400).json({ message: "receiverId is required" });
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!receiver || !sender) return res.status(404).json({ message: "User not found" });

    // Reject if already friends
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if reverse request exists (receiver sent request to sender)
    const reverseRequest = await FriendRequest.findOne({ sender: receiverId, receiver: senderId });
    if (reverseRequest) {
      // Auto-accept scenario
      await FriendRequest.findByIdAndDelete(reverseRequest._id);
      
      await User.findByIdAndUpdate(senderId, { $addToSet: { friends: receiverId } });
      await User.findByIdAndUpdate(receiverId, { $addToSet: { friends: senderId } });
      
      return res.json({ message: "auto accepted", isAutoAccept: true });
    }

    // Check if duplicate request exists
    const existing = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });
    res.json({ message: "Request sent", request });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. cancelRequest: DELETE /friend-request/cancel/:userId
exports.cancelRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;

    const result = await FriendRequest.findOneAndDelete({ sender: senderId, receiver: receiverId });
    if (!result) return res.status(404).json({ message: "Friend request not found" });

    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. acceptRequest: POST /friend-request/accept/:userId
exports.acceptRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.userId; // The one who sent the request

    const request = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
    if (!request) return res.status(404).json({ message: "Request not found" });

    await User.findByIdAndUpdate(receiverId, { $addToSet: { friends: senderId } });
    await User.findByIdAndUpdate(senderId, { $addToSet: { friends: receiverId } });

    await FriendRequest.findByIdAndDelete(request._id);

    res.json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. rejectRequest: POST /friend-request/reject/:userId
exports.rejectRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.userId;

    const request = await FriendRequest.findOneAndDelete({ sender: senderId, receiver: receiverId });
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. removeFriend: DELETE /friends/remove/:userId
exports.removeFriend = async (req, res) => {
  try {
    const userId1 = req.user.id;
    const userId2 = req.params.userId;

    await User.findByIdAndUpdate(userId1, { $pull: { friends: userId2 } });
    await User.findByIdAndUpdate(userId2, { $pull: { friends: userId1 } });

    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. getIncomingRequests: GET /friend-request/received
exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Based on the prompt: populate sender details: pfp, name, handle, tags
    // Frontend maps pfp to profilePhoto and handle to username
    const requests = await FriendRequest.find({ receiver: userId })
      .populate('sender', 'name username profilePhoto tags')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. getFriendshipStatus: GET /friendship-status/:userId
exports.getFriendshipStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId.toString()) {
        return res.json({ isFriend: false, requestSent: false, requestReceived: false });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const isFriend = currentUser.friends.includes(targetUserId);
    
    if (isFriend) {
       return res.json({ isFriend: true, requestSent: false, requestReceived: false });
    }

    const requestSent = await FriendRequest.exists({ sender: currentUserId, receiver: targetUserId });
    const requestReceived = await FriendRequest.exists({ sender: targetUserId, receiver: currentUserId });

    res.json({
       isFriend: false,
       requestSent: !!requestSent,
       requestReceived: !!requestReceived
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. getFriendsList: GET /friends/list
exports.getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'name username profilePhoto tags');

    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
