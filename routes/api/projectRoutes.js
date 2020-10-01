const express = require("express");
const ProjectsController = require("../../controllers/ProjectsController");
const auth = require("../../middlewares/jwt");
const imageUpload = require("../../helpers/s3Uploader");
const adminCheck = require("../../middlewares/adminCheck");
const validation = require("../../controllers/Validation");

const router = express.Router();

//router.get('/',auth,adminCheck, MembersController.all);
router.get("/",auth,adminCheck, ProjectsController.all);
router.get(
  "/:project_id",auth,adminCheck,
  validation.validate("project_id"),
  ProjectsController.getSpecificProject
);
router.put(
  "/update/:project_id",auth,adminCheck,
  imageUpload,
  validation.validate("project_id"),
  ProjectsController.updateProject
);
router.delete(
  "/delete/:project_id",auth,adminCheck,
  validation.validate("project_id"),
  ProjectsController.deleteProject
);
router.post(
  "/",auth,adminCheck,
  imageUpload,
  validation.validate("createProject"),
  ProjectsController.addProject
);
module.exports = router;
