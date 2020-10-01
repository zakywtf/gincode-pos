const express = require("express");
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/members', require('./memberRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/public',require("./publicRoutes"));
router.use('/menu', require('./menuRoutes'))
module.exports = router;