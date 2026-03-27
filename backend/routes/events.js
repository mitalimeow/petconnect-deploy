const express = require('express');
const router = express.Router();

// Simple in-memory cache to prevent Eventbrite rate limits during high traffic
let eventsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// 2. Data Handling & Sanitization: Phone mapping strictly to +91 XXXXX XXXXX standard
const sanitizePhoneInDesc = (desc) => {
    if (!desc) return '';
    // Maps standard local/international variants of 10 digit Indian numbering via regex
    const regex = /(?:\+?0{0,2}91[\s-]*)?([6-9]\d{4})[\s-]*(\d{5})/g;
    return desc.replace(regex, "+91 $1 $2");
};

// GET /api/events
router.get('/', async (req, res) => {
    try {
        if (eventsCache && (Date.now() - cacheTimestamp < CACHE_TTL)) {
            return res.json(eventsCache);
        }

        const API_KEY = process.env.EVENTBRITE_API_KEY;
        const DEFAULT_IMG = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800";

        let eventsData = [];

        if (API_KEY) {
            // 1. Eventbrite API integration targeted specifically around 'pet' and '+91/India' semantics
            const query = encodeURIComponent("pets animal welfare adoption vet");
            const response = await fetch(`https://www.eventbriteapi.com/v3/events/search/?q=${query}&location.address=India`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            
            const data = await response.json();
            
            if (data.events) {
                eventsData = data.events.map(ev => ({
                    id: ev.id,
                    name: ev.name.text,
                    description: sanitizePhoneInDesc(ev.description.text),
                    imageUrl: ev.logo ? ev.logo.url : DEFAULT_IMG,
                    url: ev.url,
                    date: ev.start.local,
                    isVerified: !ev.is_free,
                    category: "Awareness Campaign"
                }));
            }
        } else {
            // High Quality Realistic MOCK DATA mapped perfectly if user has not exported an active .env variable
            eventsData = [
                {
                    id: 'e1',
                    name: 'Mega Pet Adoption Drive',
                    category: 'Adoption Event',
                    description: 'Join us for the biggest animal welfare event. We have puppies, kittens, and older pets looking for their forever homes. Call us directly at 98765-43210 for inquiries.',
                    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
                    url: 'https://eventbrite.com',
                    date: '2026-05-10T10:00:00',
                    isVerified: true
                },
                {
                    id: 'e2',
                    name: 'Stray Feline Workshop',
                    category: 'Awareness Campaign',
                    description: 'Learn the ethics and operations of trap-neuter-release programs. Organized by The Feline Foundation. Helpline: +919999988888',
                    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
                    url: 'https://eventbrite.com',
                    date: '2026-05-15T14:00:00',
                    isVerified: false
                },
                {
                    id: 'e3',
                    name: 'Vet Checkup Camp Mumbai',
                    category: 'Health Clinic',
                    description: 'Free rabies testing and health checkups for Indies. Contact us at 888 887 7777 anytime.',
                    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800',
                    url: 'https://eventbrite.com',
                    date: '2026-05-20T09:00:00',
                    isVerified: true
                },
                {
                    id: 'e4',
                    name: 'Online Rescue Training',
                    category: 'Workshop',
                    description: 'Become a certified first responder for urban wildlife. Sponsored by leading Animal Welfare brands.',
                    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
                    url: 'https://eventbrite.com',
                    date: '2026-06-01T11:00:00',
                    isVerified: true
                },
                {
                    id: 'e5',
                    name: 'Street Dog Vaccination Camp',
                    category: 'Health Clinic',
                    description: 'Annual drive to vaccinate local street animals against highly infectious diseases. Help text 091- 999 888 7777 to pre-reg.',
                    imageUrl: 'https://images.unsplash.com/photo-1517451330947-f3162e08ccdf?auto=format&fit=crop&q=80&w=800',
                    url: 'https://eventbrite.com',
                    date: '2026-06-15T09:30:00',
                    isVerified: false
                }
            ];
            
            // Format fallback data descriptions utilizing the same exact standard scrubbing map
            eventsData = eventsData.map(e => ({...e, description: sanitizePhoneInDesc(e.description)}));
        }

        eventsCache = eventsData;
        cacheTimestamp = Date.now();
        res.json(eventsData);
        
    } catch (err) {
        console.error("EventService Error:", err);
        res.status(500).json({ error: "Failed to fetch community events" });
    }
});

module.exports = router;
