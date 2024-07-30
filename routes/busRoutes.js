//working properly
const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// Function to convert 12-hour format to 24-hour format
function convertTo24Hour(time) {
    const [hours, minutes, period] = time.match(/(\d+):(\d+)\s?(AM|PM)/i).slice(1);
    let hours24 = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && hours24 < 12) {
        hours24 += 12;
    }
    if (period.toUpperCase() === 'AM' && hours24 === 12) {
        hours24 = 0;
    }
    return `${hours24.toString().padStart(2, '0')}:${minutes}`;
}


router.get('/search', async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;

    try {
        const results = await Bus.find({ from: from, to: to });

         // Sort the results by converted departure time
         results.sort((a, b) => {
            const timeA = convertTo24Hour(a.departureTime);
            const timeB = convertTo24Hour(b.departureTime);
            return timeA.localeCompare(timeB);
        });

        res.json(results);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;




