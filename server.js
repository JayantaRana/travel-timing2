
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const busRoutes = require('./routes/busRoutes');
const app = express();
const cors = require('cors'); // Add this line
// const port = 4000;edit
const port = process.env.PORT || 4000;

require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(cors({
    origin: '*' // Adjust this to your frontend domain if needed
}));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

app.use('/search', busRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
