const Application = require('../models/Application');
const User = require('../models/User');

exports.submitApplication = async (req, res) => {
  try {
    const { requestedTag, reason, documents, urls } = req.body;
    
    if (!documents || documents.length === 0) {
      return res.status(400).json({ message: 'Must provide at least one proof document.' });
    }

    // Backend validation (MANDATORY per prompt)
    for (const doc of documents) {
      if (
        (doc.mimetype === 'application/pdf' || 
         doc.mimetype === 'application/msword' || 
         doc.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && 
        doc.size > 1024 * 1024
      ) {
        return res.status(400).json({ message: "Document exceeds 1MB size limit" });
      }
      
      if (doc.mimetype.startsWith('image/') && doc.size > 300 * 1024) {
        // Technically they should be compressed on FE, but backend catches it if they bypass
        return res.status(400).json({ message: "Image exceeds 300KB size limit after compression" });
      }
    }

    // Check if user already has an active pending application for this tag to prevent spam
    const existing = await Application.findOne({ userId: req.user.id, requestedTag, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application for this tag.' });
    }

    // Filter out empty URLs
    const validUrls = urls ? urls.filter(u => u.trim() !== '') : [];

    const application = new Application({
      userId: req.user.id,
      requestedTag,
      reason,
      documents,
      urls: validUrls
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
      if (!user.tags.some(t => t.name === application.requestedTag)) {
        user.tags.push({ name: application.requestedTag, color: '#F3E8E1' });
      }
      user.notifications.push({
        type: 'APPLICATION_UPDATE',
        message: `Your application for ${application.requestedTag} has been approved! You now have a blue tick mark.`
      });
      await user.save();
    }

    res.json({ message: 'Application approved successfully', application });
  } catch (err) {
    console.error('Approve application error:', err);
    res.status(500).json({ message: 'Failed to approve application' });
  }
};

exports.denyApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'pending') return res.status(400).json({ message: 'Application is not pending' });

    application.status = 'rejected';
    await application.save();

    const user = await User.findById(application.userId);
    if (user) {
      user.notifications.push({
        type: 'APPLICATION_UPDATE',
        message: `Your application for ${application.requestedTag} was denied by the Admin staff. Feel free to reapply once you possess valid documentation.`
      });
      await user.save();
    }

    res.json({ message: 'Application denied successfully', application });
  } catch (err) {
    console.error('Deny application error:', err);
    res.status(500).json({ message: 'Failed to deny application' });
  }
};
