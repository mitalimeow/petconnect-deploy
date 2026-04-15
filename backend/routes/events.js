const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const requireProfessional = require('../middleware/requireProfessional');

// GET /api/events - fetch all active future events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        // Translate 'image' to 'imageUrl' and '_id' to 'id' for frontend compatibility
        // though standardizing is better, but this makes the migration seamless
        res.json(events);
    } catch (err) {
        console.error("Events Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// POST /api/events - Create new event (Professionals only)
router.post('/', auth, requireProfessional, async (req, res) => {
    try {
        const { title, url, date, venue, image } = req.body;

        if (!title || !url || !date || !venue || !image) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newEvent = new Event({
            title,
            url,
            date,
            venue,
            image,
            createdBy: req.user.id
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        console.error("Event Creation Error:", err);
        res.status(400).json({ error: err.message || "Failed to create event." });
    }
});

// GET /api/events/user/:userId - fetch all upcoming events created by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const events = await Event.find({
            createdBy: req.params.userId,
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        res.json(events);
    } catch (err) {
        console.error("User Events Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch user events" });
    }
});

module.exports = router;
