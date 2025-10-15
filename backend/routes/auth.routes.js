const express = require('express');
const router = express.Router();
const { login, adminLogin } = require('../controllers/auth.controller');

// Login route
router.post('/login',  login);
router.post("/admin-login", adminLogin);
module.exports = router;
