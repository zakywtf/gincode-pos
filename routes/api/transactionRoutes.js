const express = require("express");
const TransactionsController = require("../../controllers/TransactionsController");
const auth = require("../../middlewares/jwt");
const imageUpload = require("../../helpers/s3Uploader");
const adminCheck = require("../../middlewares/adminCheck");
const validation = require("../../controllers/Validation");

const router = express.Router();

//router.get('/',auth,adminCheck, MembersController.all);
router.get("/",auth, TransactionsController.all);
router.get(
  "/:transaction_id",auth,
  validation.validate("transaction_id"),
  TransactionsController.getSpecificTransaction
);
router.put(
  "/update/:transaction_id",auth,
  validation.validate("transaction_id"),
  TransactionsController.updateTransaction
);
router.post(
  "/",auth,
  validation.validate("createTransaction"),
  TransactionsController.addTransaction
);
router.put(
  "/upload_payment/:transaction_id",auth,
  imageUpload,
  validation.validate("transaction_id"),
  TransactionsController.uploadPayment
);
router.put(
  "/verified_payment/:transaction_id",auth,adminCheck,
  validation.validate("transaction_id"),
  TransactionsController.verifiedPayment
);
router.put(
  "/cancel_payment/:transaction_id",auth,
  validation.validate("transaction_id"),
  TransactionsController.cancelPayment
);
router.get(
  "/member_invesments/:member_id",auth,
  validation.validate("member_id"),
  TransactionsController.invesments
);
module.exports = router;
