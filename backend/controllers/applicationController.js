const Application = require('../models/Application');
const User = require('../models/User');

exports.submitApplication = async (req, res) => {
  try {
    const { requestedTag, reason, proofLink } = req.body;
    
    // Check if user already has an active pending application for this tag to prevent spam
    const existing = await Application.findOne({ userId: req.user.id, requestedTag, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application for this tag.' });
    }

    const application = new Application({
      userId: req.user.id,
      requestedTag,
      reason,
      proofLink
    });

    await application.save();
    res.status(201).json({ message: 'Application submitted successfully.', application });
  } catch (err) {
    console.error('Submit application error:', err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'pending' }).populate('userId', 'name email username profilePhoto');
    res.json(applications);
  } catch (err) {
    console.error('Get pending applications error:', err);
    res.status(500).json({ message: 'Failed to fetch pending applications' });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'pending') return res.status(400).json({ message: 'Application is not pending' });

    application.status = 'approved';
    await application.save();

    const user = await User.findById(application.userId);
    if (user) {
      if (!user.tags.includes(application.requestedTag)) {
        user.tags.push(application.requestedTag);
      }
      user.notifications.push(`Your application for ${application.requestedTag} has been approved!`);
      await user.save();
    }

    res.json({ message: 'Application approved successfully', application });
  } catch (err) {
    console.error('Approve application error:', err);
    res.status(500).json({ message: 'Failed to approve application' });
  }
};
