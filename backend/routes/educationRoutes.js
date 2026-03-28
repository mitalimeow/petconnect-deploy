const express = require('express');
const router = express.Router();
const EducationInteraction = require('../models/EducationInteraction');
const auth = require('../middleware/auth');

// Get all education interactions
router.get('/', async (req, res) => {
  try {
    const interactions = await EducationInteraction.find();
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching interactions' });
  }
});

// Update likes for an article (Toggle Logic)
router.post('/like/:articleId', async (req, res) => {
  const { articleId } = req.params;
  const { userId } = req.body;
  
  try {
    let interaction = await EducationInteraction.findOne({ articleId });
    if (!interaction) {
      interaction = new EducationInteraction({ 
        articleId, 
        likes: 1, 
        likedBy: userId ? [userId] : [] 
      });
    } else {
      const likedIndex = interaction.likedBy.indexOf(userId);
      if (likedIndex > -1) {
        // Already liked, so unlike
        interaction.likedBy.splice(likedIndex, 1);
        interaction.likes = Math.max(0, interaction.likes - 1);
      } else {
        // Not liked yet, so like
        if (userId) interaction.likedBy.push(userId);
        interaction.likes += 1;
      }
    }
    await interaction.save();
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating likes' });
  }
});

// Add a comment to an article
router.post('/comment/:articleId', async (req, res) => {
  const { articleId } = req.params;
  const { handle, displayName, text } = req.body;
  try {
    let interaction = await EducationInteraction.findOne({ articleId });
    if (!interaction) {
      interaction = new EducationInteraction({ articleId, comments: [] });
    }
    
    interaction.comments.push({
      handle,
      displayName,
      text,
      id: Date.now()
    });
    
    await interaction.save();
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

module.exports = router;
