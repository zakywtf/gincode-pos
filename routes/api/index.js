const express = require("express");
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/menu', require('./menuRoutes'))
module.exports = router;