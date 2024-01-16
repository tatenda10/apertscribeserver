const jwt = require('jsonwebtoken');
const util = require('util');








const verifyUser = async (req, res) => {
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
        console.error('Error processing user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const logoutUser = (req, res) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authorizationHeader.split(' ')[1];
        console.log('Logging out. Invalidating token:', token);

        // Add the token to the blacklist
        tokenBlacklist.add(token);
        console.log('Request Headers:', req.headers);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const tokenBlacklist = new Set();
console.log('Token Blacklist:', tokenBlacklist);


const authenticateAndInvalidateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Assuming the token is in the "Authorization" header

        console.log('Received token:', token);

        // Check if the token is in the blacklist
        if (tokenBlacklist.has(token)) {
            console.log('Token is in the blacklist');
            return res.status(401).json({ error: 'Token is no longer valid' });
        }

        // Verify the token
        const decoded = await util.promisify(jwt.verify)(token, 'your_secret_key');

        console.log('Token verified. Decoded payload:', decoded);

        // Attach the decoded payload to the request for later use
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Error during token verification:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};



module.exports = { verifyUser, logoutUser, authenticateAndInvalidateToken };
