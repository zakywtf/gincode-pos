const express = require('express');
const router = express.Router();
const IndexController = require('../controllers/IndexController');
const adminCheck = require('../middlewares/adminCheck')

router.get('/', IndexController.index);
router.get('/ping', IndexController.ping);

// Routes Prefixes
router.use('/api', require('./api/index'));

module.exports = router;
