const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/db'); // Replace this with the correct path to your db connection
const util = require('util');
const { verifyUser, logoutUser } = require('../controllers/Users');
 // Import the logoutUser controller
const tokenBlacklist = new Set();

const queryAsync = util.promisify(db.query).bind(db);

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username and password match the expected values
        if (username === 'sysadmin' && password === 'kunashe07') {
            // Generate a JWT token
            const token = jwt.sign({ userId: 1 }, 'your_secret_key', { expiresIn: '1h' });

            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - Token not provided' });
        }

        const token = authorizationHeader.split(' ')[1];
        console.log('Logging out. Invalidating token:', token);

        // Assuming you have a tokenBlacklist defined somewhere
        tokenBlacklist.add(token);

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error in logout route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
