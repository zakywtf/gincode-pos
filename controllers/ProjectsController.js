const Projects = require("../models/projects");
const Transactions = require("../models/transactions");
const apiResponse = require("../helpers/apiResponse");
const { validationResult, check } = require("express-validator");
const randomPassword = require("generate-password");
const bcrypt = require("bcrypt");
const { default: async } = require("async");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const ProjectsController = {
  all: (req, res, next) => {
    try {
      Projects.find({ isDelete: false })
        .populate("project_owner", "_id name")
        .select("-isDelete -updated_at -__v -created_at -project_profile")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err.message);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(res, "No projects found");

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
  publicProject: async (req, res, next) => {
    try {
      let paid = await Transactions.countDocuments({ status: "paid" });
      let verified = await Transactions.countDocuments({ status: "verified" });
      // let equity = await Transactions.find({
      //   member: req.params.member_id,
      //   status: "verified"
      // }).populate({ path:'project', select:'status project_name', match: { status: "funded" } });
      let equity = await Transactions.aggregate([
        {
          $match: {
            member: ObjectId(req.params.member_id),
            status: "verified"
          }
        },
        {
          $lookup: {
            from: Projects.collection.name,
            localField: "project",
            foreignField: "_id",
            as: "project"
          }
        },
        {
          $unwind: "$project"
        },
        {
          $match: {
            "project.status": "funded"
          }
        },
        {
          $group: {
            _id: {
              project_id: "$project._id",
              project_name: "$project.project_name",
              project_status: "$project.status"
            },
            total_equity: { $sum: "$value" },
            transaction: {
              $push: {
                transaction_id: "$_id",
                transaction_code: "$transaction_id",
                transaction_value: "$value",
                transaction_status: "$status"
              }
            }
          }
        }
      ]);

      console.log("verified: " + verified + " - Paid: " + paid);
      let transaction = {
        total: verified + paid,
        verified: verified,
        paid: paid
      };
      Projects.find({ isDelete: false, status: { $in: ["funded", "ongoing"] } })
        .populate("project_owner", "_id name")
        .select("-isDelete -updated_at -__v -created_at -project_profile")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err.message);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(res, "No projects found");

          return apiResponse.successResponseWithData(res, "Data retrieved", {
            project: data,
            transaction,
            member_investment: equity
          });
        });
    } catch (error) {
      return next(error);
    }
  },
  getSpecificProject: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      Projects.find({ _id: req.params.project_id })
        .populate("project_owner", "_id name")
        .select("-isDelete -updated_at -__v")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(res, "project not found");

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
  getSpecificPublicProject: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      let transaksi = await Transactions.find({
        project: req.body.project_id,
        member: req.body.member_id
      }).select("status value transaction_id _id");

      let transactionData;
      if (transaksi.length < 1) {
        transactionData = {
          transaction: transaksi,
          total_investment: 0
        };
      } else {
        let totalInvestment = 0;
        for (let index = 0; index < transaksi.length; index++) {
          if (transaksi[index].status === "verified") {
            totalInvestment =
              parseInt(totalInvestment) + parseInt(transaksi[index].value);
          }
        }
        transactionData = {
          transaction: transaksi,
          total_investment: totalInvestment
        };
      }

      Projects.find({ _id: req.body.project_id })
        .populate("project_owner", "_id name")
        .select("-isDelete -updated_at -__v")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(res, "project not found");

          return apiResponse.successResponseWithData(res, "Data retrieved", {
            projects_data: data,
            transaction_data: transactionData
          });
        });
    } catch (error) {
      return next(error);
    }
  },
  addProject: async (req, res, next) => {
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

      if (req.files.banner_project)
        req.body.banner_project = uploadedImage.banner_project[0]["location"];
    }

    try {
      let project = new Projects({
        project_name: req.body.project_name,
        banner_project: req.body.banner_project,
        project_profile: req.body.project_profile,
        project_category: req.body.project_category,
        deadline: req.body.deadline,
        project_owner: req.body.project_owner,
        pic: req.body.pic,
        target_goal: req.body.target_goal,
        status: "ongoing"
      });

      project.save((err, data) => {
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
  updateProject: async (req, res, next) => {
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

      if (req.files.banner_project)
        req.body.banner_project = uploadedImage.banner_project[0]["location"];
    }

    try {
      Projects.findOneAndUpdate(
        { _id: req.params.project_id },
        req.body,
        { new: true },
        (err, projectData) => {
          if (err) return apiResponse.ErrorResponse(res, err);
          return apiResponse.successResponseWithData(
            res,
            "project updated succesfully.",
            projectData
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  finishProject: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      Projects.findOneAndUpdate(
        { _id: req.params.project_id },
        {
          $set: {
            status: "finish"
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Project ID not found / Project has been deleted"
            );
          return apiResponse.successResponse(
            res,
            "project finish successfully"
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  deleteProject: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      Projects.findOneAndUpdate(
        { _id: req.params.project_id },
        {
          $set: {
            isDelete: true
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Project ID not found / Project has been deleted"
            );
          return apiResponse.successResponse(
            res,
            "project deleted successfully"
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = ProjectsController;
