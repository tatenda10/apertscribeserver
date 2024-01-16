exports.logout = (req, res) => {
    try { 
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Clear the session cookie
            res.clearCookie('yourSessionCookieName');

            // Respond with a success message
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Error in logout controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};