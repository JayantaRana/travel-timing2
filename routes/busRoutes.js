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

router.get('/search', async (req, res) => {
    const { from, to, keyword, route, startTime, endTime, sbstcOnly, privateOnly } = req.query;

    try {
        console.log('Received Query:', req.query);

        // Initialize query object
        const query = {};

        // Add 'from' and 'to' conditions
        if (from) query.from = { $regex: new RegExp(from, 'i') };
        if (to) query.to = { $regex: new RegExp(to, 'i') };

        // Add filter conditions for SBSTC or private buses
        if (sbstcOnly === 'true' && privateOnly === 'true') {
            // Show all buses
        } else if (sbstcOnly === 'true') {
            query.name = 'SBSTC'; // Only SBSTC buses
        } else if (privateOnly === 'true') {
            query.name = { $ne: 'SBSTC' }; // Exclude SBSTC buses
        }

        // Add keyword search (name, route, moreInfo)
        if (keyword) {
            query.$or = [
                { name: { $regex: new RegExp(keyword, 'i') } },
                { route: { $regex: new RegExp(keyword, 'i') } },
                { moreInfo: { $regex: new RegExp(keyword, 'i') } }
            ];
        }

        // Add route keyword search
        if (route) {
            query.route = { $regex: new RegExp(route, 'i') };
        }

        console.log('Constructed Query:', query);

        // Fetch results from database
        let results = await Bus.find(query);

        // Filter by time range if provided
        if (startTime && endTime) {
            results = results.filter(bus =>
                isWithinTimeRange(bus.departureTime, startTime, endTime)
            );
        }

        // Sort results by departure time
        results.sort((a, b) => {
            const timeA = convertTo24Hour(a.departureTime);
            const timeB = convertTo24Hour(b.departureTime);
            return timeA.localeCompare(timeB);
        });

        // Return results
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




