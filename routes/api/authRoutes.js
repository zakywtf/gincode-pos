const express = require('express');
const AuthController = require('../../controllers/AuthController');
const validation = require('../../controllers/Validation');
const auth = require("../../middlewares/jwt");
const adminCheck = require("../../middlewares/adminCheck");

const router = express.Router();
//,auth,adminCheck,
router.post('/register', validation.validate('register'), AuthController.register);
router.post('/login',validation.validate('login'), AuthController.login);

module.exports = router;