// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/Authcontroller');

router.post('/logout', authController.logout);

module.exports = router;
