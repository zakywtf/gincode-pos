const Transactions = require("../models/transactions");
// const Projects = require("../models/projects");
const apiResponse = require("../helpers/apiResponse");
const { validationResult, check } = require("express-validator");
const { generate } = require("../middlewares/randGen");
const randomPassword = require("generate-password");
const bcrypt = require("bcrypt");
const { default: async } = require("async");

const TransactionsController = {
  all: (req, res, next) => {
    try {
      Transactions.find()
        .populate("project", "_id project_name target_goal")
        .populate("member", "_id name")
        //.select('-password')
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err.message);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(
              res,
              "No transactions found"
            );

          return apiResponse.successResponseWithData(
            res,
            "Data retrieved",
            data
          );
        });
    } catch (error) {
      return next(error);
    }
  },
  getSpecificTransaction: async (req, res, next) => {
    try {
      const errors = await validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }

      Transactions.find({ _id: req.params.transaction_id })
        .populate("member", "_id name")
        .populate("project", "_id project_name target_goal pic")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(
              res,
              "transaction not found"
            );

          return apiResponse.successResponseWithData(
            res,
            "Data retrieved",
            data
          );
        });
    } catch (error) {
      return next(error);
    }
  },
  addTransaction: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    let transaksi = await Transactions.find({
      member: req.body.member,
      project: req.body.project,
      status: "unpaid"
    });

    if (transaksi.length)
      return apiResponse.ErrorResponseWithData(
        res,
        "Member can't create another transaction because there is another transaction in this project unpaid",
        transaksi
      );

    var transaction_id = await generate();

    try {
      let transaction = new Transactions({
        share: req.body.share,
        value: req.body.value,
        member: req.body.member,
        project: req.body.project,
        transaction_id: transaction_id,
        status: "unpaid"
      });

      let project = await Projects.findOne({
        _id: req.body.project,
        isDelete: false
      });
      console.log(
        "pending goal: " +
          (parseInt(project.pending_goal) + parseInt(req.body.value)) +
          " total:" +
          project.target_goal
      );
      if (
        parseInt(project.pending_goal) +
          parseInt(project.receive_goal) +
          parseInt(req.body.value) >
        project.target_goal
      ) {
        let sisa =
          parseInt(project.target_goal) -
          (parseInt(project.pending_goal) + parseInt(project.receive_goal));
        return apiResponse.ErrorResponse(
          res,
          "There is not enough share to buy !, trying to buy " +
            req.body.value +
            "jt, while remaining stock is " +
            sisa +
            "jt"
        );
      }
      let totalPending =
        parseInt(project.pending_goal) + parseInt(req.body.value);

      Projects.findOneAndUpdate(
        { _id: req.body.project, isDelete: false },
        {
          $set: {
            pending_goal: totalPending
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Project ID not found / Project has been deleted"
            );
        }
      );

      console.log("test :" + project.pending_goal);
      transaction.save((err, data) => {
        if (err) return apiResponse.ErrorResponse(res, err);

        return apiResponse.successResponseWithData(
          res,
          "Project added succesfully.",
          data
        );
      });
    } catch (error) {
      return next(error);
    }
  },
  updateTransaction: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }
    try {
      Transactions.findOneAndUpdate(
        { _id: req.params.transaction_id },
        req.body,
        { new: true },
        (err, transactionData) => {
          if (err) return apiResponse.ErrorResponse(res, err);
          return apiResponse.successResponseWithData(
            res,
            "transaction updated succesfully.",
            transactionData
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  uploadPayment: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    if (req.files) {
      const uploadedImage = req.files;

      if (req.files.proof_of_payment)
        req.body.proof_of_payment =
          uploadedImage.proof_of_payment[0]["location"];
    }

    try {
      let transaksi = await Transactions.findOne({
        _id: req.params.transaction_id
      });

      if (transaksi.status !== "unpaid")
        return apiResponse.ErrorResponse(
          res,
          "Only transaction with status of unpaid can upload proof of payment, this transaction status is " +
            transaksi.status
        );

      Transactions.findOneAndUpdate(
        { _id: req.params.transaction_id },
        {
          $set: {
            pay_at: Date.now(),
            status: "paid",
            proof_of_payment: req.body.proof_of_payment
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Transaction ID not found / Transaction has been deleted"
            );
          return apiResponse.successResponseWithData(
            res,
            "transaction updated succesfully."
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  verifiedPayment: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      let transaksi = await Transactions.findOne({
        _id: req.params.transaction_id
      });

      if (transaksi.status !== "paid")
        return apiResponse.ErrorResponse(
          res,
          "Cannot verified Transaction because transaction status is " +
            transaksi.status +
            ", Transaction status must be paid to be verified"
        );
      let project = await Projects.findOne(
        {
          _id: transaksi.project,
          isDelete: false
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Project ID not found / Project has been deleted"
            );
        }
      );

      let pending = project.pending_goal;
      let verified = project.receive_goal;
      if (parseInt(transaksi.value) > parseInt(project.pending_goal))
        return apiResponse.ErrorResponse(
          res,
          "Pending value is not enough, pending: " +
            project.pending_goal +
            " ,Transaction value: " +
            transaksi.value
        );
      pending = parseInt(project.pending_goal) - parseInt(transaksi.value);
      verified = parseInt(project.receive_goal) + parseInt(transaksi.value);
      if (verified === project.target_goal) {
        Projects.findOneAndUpdate(
          { _id: transaksi.project, isDelete: false },
          {
            $set: {
              pending_goal: pending,
              receive_goal: verified,
              status: "funded"
            }
          },
          err => {
            if (err)
              return apiResponse.ErrorResponse(
                res,
                "Project ID not found / Project has been deleted"
              );
          }
        );
      } else {
        Projects.findOneAndUpdate(
          { _id: transaksi.project, isDelete: false },
          {
            $set: {
              pending_goal: pending,
              receive_goal: verified
            }
          },
          err => {
            if (err)
              return apiResponse.ErrorResponse(
                res,
                "Project ID not found / Project has been deleted"
              );
          }
        );
      }

      Transactions.findOneAndUpdate(
        { _id: req.params.transaction_id },
        {
          $set: {
            status: "verified"
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Transaction ID not found / Transaction has been deleted"
            );
          return apiResponse.successResponseWithData(
            res,
            "transaction updated succesfully."
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  cancelPayment: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      let transaksi = await Transactions.findOne({
        _id: req.params.transaction_id
      });

      if (transaksi.status !== "verified")
        return apiResponse.ErrorResponse(
          res,
          "Cannot cancel Transaction because transaction status is " +
            transaksi.status +
            ", Transaction status must be unpaid and paid to be cancel"
        );

      let project = await Projects.findOne(
        {
          _id: transaksi.project,
          isDelete: false
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Project ID not found / Project has been deleted"
            );
        }
      );
      let pending = project.pending_goal;
      pending = parseInt(project.pending_goal) - parseInt(transaksi.value);
      Projects.findOneAndUpdate(
        { _id: transaksi.project, isDelete: false },
        {
          $set: {
            pending_goal: pending
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Project ID not found / Project has been deleted"
            );
        }
      );

      Transactions.findOneAndUpdate(
        { _id: req.params.transaction_id },
        {
          $set: {
            status: "cancel"
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Transaction ID not found / Transaction has been deleted"
            );
          return apiResponse.successResponseWithData(
            res,
            "transaction updated succesfully."
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  invesments: async (req, res, next) => {
    const errors = await validationResult(req);
    try {
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      Transactions.find({ member: req.params.member_id, status:{$ne: "cancel"} })
        .populate("member", "_id name")
        .populate("project", "_id project_name target_goal pic status")
        //.select('-password')
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err.message);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(
              res,
              "No transactions found"
            );

          return apiResponse.successResponseWithData(
            res,
            "Data retrieved",
            data
          );
        });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = TransactionsController;
