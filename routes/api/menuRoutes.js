const express = require("express");
const MenuController = require("../../controllers/MenuController");
const auth = require("../../middlewares/jwt");
const imageUpload = require("../../helpers/s3Uploader");
const adminCheck = require("../../middlewares/adminCheck");
const validation = require("../../controllers/Validation");

const router = express.Router();

//router.get('/',auth,adminCheck, MembersControllSer.all);
router.get("/", MenuController.all);
router.post("/", 
    imageUpload, 
    auth, 
    validation.validate("createMenu"),
    MenuController.addMenus
    );
router.get(
    "/:menu_id",
    auth,
    validation.validate("menu_id"),
    MenuController.getSpecificMenu
  );
router.put(
    "/update/:menu_id",
    auth,
    validation.validate("menu_id"),
    MenuController.updateMenu
);
router.delete(
    "/delete/:menu_id",
    auth,
    adminCheck,
    validation.validate("menu_id"),
    MenuController.deleteMenu
  );
module.exports = router;
