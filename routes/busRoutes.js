// //working properly
// const express = require('express');
// const router = express.Router();
// const Bus = require('../models/Bus');

// // Function to convert 12-hour format to 24-hour format
// function convertTo24Hour(time) {
//     const [hours, minutes, period] = time.match(/(\d+):(\d+)\s?(AM|PM)/i).slice(1);
//     let hours24 = parseInt(hours, 10);
//     if (period.toUpperCase() === 'PM' && hours24 < 12) {
//         hours24 += 12;
//     }
//     if (period.toUpperCase() === 'AM' && hours24 === 12) {
//         hours24 = 0;
//     }
//     return `${hours24.toString().padStart(2, '0')}:${minutes}`;
// }


// router.get('/search', async (req, res) => {
//     const from = req.query.from;
//     const to = req.query.to;

//     try {
//         const results = await Bus.find({ from: from, to: to });

//          // Sort the results by converted departure time
//          results.sort((a, b) => {
//             const timeA = convertTo24Hour(a.departureTime);
//             const timeB = convertTo24Hour(b.departureTime);
//             return timeA.localeCompare(timeB);
//         });

//         res.json(results);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// module.exports = router;



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

// Helper function for time comparison
function isWithinTimeRange(time, start, end) {
    const convertedTime = convertTo24Hour(time);
    const startTime = convertTo24Hour(start);
    const endTime = convertTo24Hour(end);
    return convertedTime >= startTime && convertedTime <= endTime;
}

router.get('/search', async (req, res) => {
    const { from, to, startTime, endTime, route, keyword } = req.query;

    try {
        // Build query dynamically
        const query = {};
        if (from) query.from = { $regex: new RegExp(from, 'i') }; // Case-insensitive match
        if (to) query.to = { $regex: new RegExp(to, 'i') }; // Case-insensitive match
        if (route) query.route = { $regex: new RegExp(route, 'i') }; // Match route keyword
        if (keyword) query.moreInfo = { $regex: new RegExp(keyword, 'i') }; // Match in moreInfo

        let results = await Bus.find(query);

        // Filter by time range if provided
        if (startTime && endTime) {
            results = results.filter(bus =>
                isWithinTimeRange(bus.departureTime, startTime, endTime)
            );
        }

        // Sort the results by converted departure time
        results.sort((a, b) => {
            const timeA = convertTo24Hour(a.departureTime);
            const timeB = convertTo24Hour(b.departureTime);
            return timeA.localeCompare(timeB);
        });

        if (results.length === 0) {
            res.status(404).json({ message: 'No buses found matching your criteria.' });
        } else {
            res.json(results);
        }
    } catch (error) {
        console.error('Error in search route:', error);
        res.status(500).send({ error: 'An error occurred while searching for buses.' });
    }
});

module.exports = router;





