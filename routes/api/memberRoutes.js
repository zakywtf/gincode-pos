const express = require('express');
const MembersController = require('../../controllers/MembersController');
const auth = require("../../middlewares/jwt");
const imageUpload = require("../../helpers/s3Uploader");
const adminCheck = require("../../middlewares/adminCheck");
const validation = require('../../controllers/Validation');

const router = express.Router();

//router.get('/',auth,adminCheck, MembersController.all);
router.get('/',auth,adminCheck, MembersController.all);
router.get('/:member_id',auth,adminCheck,validation.validate('member_id'), MembersController.getSpecificMember);
router.put('/update/:member_id',auth,adminCheck,validation.validate('member_id'), MembersController.updateMember);
router.delete('/delete/:member_id',auth,adminCheck,validation.validate('member_id'), MembersController.deleteMember);
router.post('/changePass/:member_id',auth, validation.validate('changePass'), MembersController.changePassword);
module.exports = router;
