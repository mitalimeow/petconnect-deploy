const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
         path: 'notifications.petId',
         select: 'petName image' 
      })
      .select('notifications');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Format for frontend
    const formatted = user.notifications.map(n => ({
      id: n._id,
      type: n.type,
      message: n.message,
      image: n.type === 'LOST_PET_ALERT' && n.petId ? n.petId.image : n.image,
      petId: n.petId ? n.petId._id : null,
      redirect: n.type === 'LOST_PET_ALERT' ? '/lost-found' : '/profile',
      createdAt: n.createdAt,
      isRead: n.isRead
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);

    res.json(formatted);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Use positional operator to update the specific notification in the array
    await User.updateOne(
      { _id: userId, "notifications._id": notificationId },
      { $set: { "notifications.$.isRead": true } }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
