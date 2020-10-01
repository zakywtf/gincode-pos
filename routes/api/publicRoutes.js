const express = require("express");
const ProjectsController = require("../../controllers/ProjectsController");
const auth = require("../../middlewares/jwt");
const imageUpload = require("../../helpers/s3Uploader");
const adminCheck = require("../../middlewares/adminCheck");
const validation = require("../../controllers/Validation");

const router = express.Router();

//router.get('/',auth,adminCheck, MembersController.all);
router.get(
  "/projects/:member_id",auth,
  validation.validate("member_id"),
  ProjectsController.publicProject
);
router.post(
  "/project",auth,
  validation.validate("project_id"),
  validation.validate("member_id"),
  ProjectsController.getSpecificPublicProject
);
module.exports = router;
