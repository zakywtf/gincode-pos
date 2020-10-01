const express = require("express");
const MenuController = require("../../controllers/MenuController");
const auth = require("../../middlewares/jwt");
const imageUpload = require("../../helpers/s3Uploader");
const adminCheck = require("../../middlewares/adminCheck");
const validation = require("../../controllers/Validation");

const router = express.Router();

//router.get('/',auth,adminCheck, MembersControllSer.all);
router.get("/", MenuController.all);
router.post(
  "/",
//   auth,
  imageUpload,
//   validation.validate("createTransaction"),
  MenuController.addMenus
);
module.exports = router;
