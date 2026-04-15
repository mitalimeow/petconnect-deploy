const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const professionalTags = [
        'shelter owner', 
        'vet', 
        'pet store', 
        'trainer', 
        'ethical breeder', 
        'transporter', 
        'pet stylist',
        'admin'
    ];

    const isProfessional = user.tags && user.tags.some(tag => {
        const tagName = typeof tag === 'string' ? tag : (tag?.name || '');
        return tagName && professionalTags.includes(tagName.toLowerCase());
    });

    if (!isProfessional) {
        return res.status(403).json({ message: 'Access denied: Professionals only' });
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error("RequireProfessional Error:", err);
    res.status(500).json({ message: 'Server error verifying permissions' });
  }
};
