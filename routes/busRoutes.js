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

//update for search function only 

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

// // Helper function for time comparison
// function isWithinTimeRange(time, start, end) {
//     const convertedTime = convertTo24Hour(time);
//     const startTime = convertTo24Hour(start);
//     const endTime = convertTo24Hour(end);
//     return convertedTime >= startTime && convertedTime <= endTime;
// }

// router.get('/search', async (req, res) => {
//     const { from, to, keyword, route, startTime, endTime } = req.query;

//     try {
//         // Build query dynamically
//         const query = {};

//         if (from) query.from = { $regex: new RegExp(from, 'i') }; // Case-insensitive match for 'from'
//         if (to) query.to = { $regex: new RegExp(to, 'i') }; // Case-insensitive match for 'to'
        
//         // Search by bus name, route, or additional info (depending on the user input)
//         if (keyword) {
//             query.$or = [
//                 { name: { $regex: new RegExp(keyword, 'i') } }, // Match bus name
//                 { route: { $regex: new RegExp(keyword, 'i') } }, // Match route
//                 { moreInfo: { $regex: new RegExp(keyword, 'i') } } // Match any additional info
//             ];
//         }
//         if (route) query.route = { $regex: new RegExp(route, 'i') }; // Match the route keyword if provided

//         let results = await Bus.find(query);

//         // Filter by time range if provided
//         if (startTime && endTime) {
//             results = results.filter(bus =>
//                 isWithinTimeRange(bus.departureTime, startTime, endTime)
//             );
//         }

//         // Sort the results by converted departure time
//         results.sort((a, b) => {
//             const timeA = convertTo24Hour(a.departureTime);
//             const timeB = convertTo24Hour(b.departureTime);
//             return timeA.localeCompare(timeB);
//         });

//         // Return results
//         if (results.length === 0) {
//             res.status(404).json({ message: 'No buses found matching your criteria.' });
//         } else {
//             res.json(results);
//         }
//     } catch (error) {
//         console.error('Error in search route:', error);
//         res.status(500).send({ error: 'An error occurred while searching for buses.' });
//     }
// });

// module.exports = router;


//update for both search and filter date - 11.12.2024

const express = require('express');
const router = express.Router();
const Bus = require('./models/Bus'); // Assuming your Bus model is in the models directory

router.get('/search', async (req, res) => {
    const { from, to, keyword, route, startTime, endTime, sbstcOnly, privateOnly } = req.query;

    try {
        // Initialize query object
        const query = {};

        // Add 'from' and 'to' filters
        if (from) query.from = { $regex: new RegExp(from, 'i') };
        if (to) query.to = { $regex: new RegExp(to, 'i') };

        // Add keyword search (name, route, moreInfo)
        if (keyword) {
            query.$or = [
                { name: { $regex: new RegExp(keyword, 'i') } },
                { route: { $regex: new RegExp(keyword, 'i') } },
                { moreInfo: { $regex: new RegExp(keyword, 'i') } }
            ];
        }

        // Add route-specific filter
        if (route) {
            query.route = { $regex: new RegExp(route, 'i') };
        }

        // Filter by SBSTC or private buses
        if (sbstcOnly === 'true') {
            query.name = 'SBSTC';
        } else if (privateOnly === 'true') {
            query.name = { $ne: 'SBSTC' }; // Exclude SBSTC buses
        }

        // Fetch buses matching the query
        let buses = await Bus.find(query);

        // Filter results by time range if both startTime and endTime are provided
        if (startTime && endTime) {
            buses = buses.filter(bus =>
                isWithinTimeRange(bus.departureTime, startTime, endTime)
            );
        }

        // Sort results by departure time
        buses.sort((a, b) => {
            const timeA = convertTo24Hour(a.departureTime);
            const timeB = convertTo24Hour(b.departureTime);
            return timeA.localeCompare(timeB);
        });

        // Return results
        if (buses.length === 0) {
            res.status(404).json({ message: 'No buses found matching your criteria.' });
        } else {
            res.json(buses);
        }
    } catch (error) {
        console.error('Error in search route:', error);
        res.status(500).send({ error: 'An error occurred while searching for buses.' });
    }
});

/**
 * Helper function to check if a time is within a range.
 */
function isWithinTimeRange(departureTime, startTime, endTime) {
    const departure = convertTo24Hour(departureTime);
    const start = convertTo24Hour(startTime);
    const end = convertTo24Hour(endTime);
    return departure >= start && departure <= end;
}

/**
 * Helper function to convert 12-hour time to 24-hour time.
 */
function convertTo24Hour(time) {
    const [hours, minutes] = time.match(/\d+/g).map(Number);
    const isPM = time.toLowerCase().includes('pm');
    return `${isPM && hours < 12 ? hours + 12 : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

module.exports = router;




