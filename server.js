require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const moment = require('moment');
const fs = require('fs');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Define user schema
const userSchema = new mongoose.Schema({
    email: String,
    username: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
    age: Number,
    country: String,
    gender: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const itemSchema = new mongoose.Schema({
    username: String,
    picture1: String,
    picture2: String,
    picture3: String,
    names: String,
    descriptions: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null }
});

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema); // Create model for item

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register', { message: '' }); // Pass an empty message initially
});

app.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.render('register', { message: 'User already exists. Choose a different username.' });
        }

        const {email, username, password, firstName, lastName, age, country, gender } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, username, password: hashedPassword, firstName, lastName, age, country, gender });
        await user.save();

        // Send welcome email
        const recipient = email; // Assuming the username is also the email address
        const info = await transporter.sendMail({
            from: 'awexeoz7z@gmail.com',
            to: recipient,
            subject: "Welcome to Travel Agency",
            text: "Thank you for choosing us!"
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Function to validate password
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    return passwordRegex.test(password);
}

app.get('/login', (req, res) => {
    res.render('login', { message: '' }); // Pass an empty message initially
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { message: 'Incorrect username or password. Please try again.' });
    }

    req.session.userId = username; // Store username instead of user._id

    return res.redirect('/home');
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        try {
            // Find items where the username matches the logged-in user's username
            const items = await Item.find({ username: req.session.userId });
            res.render('dashboard', { items });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});



app.use(bodyParser.json());

const toursFilePath = path.join(__dirname, 'data', 'tours.json');
const historyFilePath = path.join(__dirname, 'data', 'history.json');


let tours = [];
if (fs.existsSync(toursFilePath)) {
    tours = JSON.parse(fs.readFileSync(toursFilePath, 'utf8'));
}


let history = [];
if (fs.existsSync(historyFilePath)) {
    history = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
}

app.post('/deleteHistoryEntry', (req, res) => {
    const { index } = req.body;

    if (index !== undefined && index >= 0 && index < history.length) {

        history.splice(index, 1);
        saveHistoryToFile();

        res.json({ message: 'History entry deleted successfully' });
    } else {
        res.status(400).json({ error: 'Invalid index provided' });
    }
});

function saveToursToFile() {
    fs.writeFileSync(toursFilePath, JSON.stringify(tours, null, 2), 'utf8');
}


function saveHistoryToFile() {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf8');
}


app.post('/saveBookingToHistory', (req, res) => {
    const { city, adults, children } = req.body;
    const timestamp = new Date();


    if (!Array.isArray(history)) {
        history = [];
    }

    history.push({ city, adults, children, timestamp });
    saveHistoryToFile();

    res.json({ message: 'Booking information saved to history successfully' });
});

app.get('/history', (req, res) => {
    res.json({ history });
});


app.get('/tours', (req, res) => {
    res.json({ tours });
});


app.get('/tours/:city', (req, res) => {
    const city = req.params.city;
    const tour = tours.find((tour) => tour.city === city);

    if (tour) {
        res.json({ tour });
    } else {
        res.status(404).json({ error: 'Tour not found' });
    }
});


app.post('/tours', (req, res) => {
    const newTour = req.body;
    tours.push(newTour);
    saveToursToFile();
    res.json({ message: 'Tour added successfully', tour: newTour });
});


app.put('/tours/:city', (req, res) => {
    const cityToUpdate = req.params.city;
    const updatedTour = req.body;

    const index = tours.findIndex((tour) => tour.city === cityToUpdate);
    if (index !== -1) {
        tours[index] = { ...tours[index], ...updatedTour };
        saveToursToFile();
        res.json({ message: 'Tour updated successfully', tour: tours[index] });
    } else {
        res.status(404).json({ error: 'Tour not found' });
    }
});


app.delete('/tours/:city', (req, res) => {
    const cityToDelete = req.params.city;

    const index = tours.findIndex((tour) => tour.city === cityToDelete);
    if (index !== -1) {
        const deletedTour = tours.splice(index, 1)[0];
        history.push({ ...deletedTour, timestamp: new Date() });
        saveToursToFile();
        saveHistoryToFile();
        res.json({ message: 'Tour deleted successfully', tour: deletedTour });
    } else {
        res.status(404).json({ error: 'Tour not found' });
    }
});

app.use(express.static('public'));

app.get('/routes/travelRoutes.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'routes', 'travelRoutes.js'));
});

dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


app.get('/travelagency', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'travelagency.html'));
});

app.post('/travelagency', async (req, res) => {
    try {

        const tourCost = calculateTourCost(req.body);


        const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY;
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${req.body.city}&appid=${weatherApiKey}&units=metric`
        );
        const weatherConditions = weatherResponse.data.weather[0].description;

        const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
        const tourResult = {
            tour: req.body,
            cost: tourCost,
            weather: {
                temperature: weatherResponse.data.main.temp,
                conditions: weatherConditions,
            },
            timestamp: timestamp,
        };


        console.log('Tour Result:', tourResult);


        tourHistory.push(tourResult);


        res.json({ success: true, message: 'Tour booked successfully', tourResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error processing the tour request' });
    }
});

app.get('/tourhistory', (req, res) => {
    res.json({ success: true, tourHistory });
});


app.get('/getWeather', async (req, res) => {
    try {
        const city = req.query.city;
        const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY;
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
        );

        res.json(weatherResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching weather information' });
    }
});


app.post('/saveBookingToHistory', (req, res) => {
    const { city, adults, children } = req.body;
    const timestamp = new Date();


    history.push({ city, adults, children, timestamp });
    saveHistoryToFile();

    res.json({ message: 'Booking information saved to history successfully' });
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
