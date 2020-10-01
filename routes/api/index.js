const express = require("express");
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/menu', require('./menuRoutes'))
module.exports = router;