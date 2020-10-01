const Members = require("../models/members");
const apiResponse = require("../helpers/apiResponse");
const { validationResult, check } = require("express-validator");
const randomPassword = require("generate-password");
const bcrypt = require("bcrypt");
const { default: async } = require("async");

const MembersController = {
  all: (req, res, next) => {
    try {
      Members.find({ isDelete: false })
        .select("-password")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err.message);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(res, "No member found");

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
  getSpecificMember: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }
    try {
      Members.find({ _id: req.params.member_id }).exec((err, data) => {
        if (err) return apiResponse.ErrorResponse(res, err);

        if (!data.length)
          return apiResponse.dataNotFoundResponse(res, "Member not found");

        return apiResponse.successResponseWithData(res, "Data retrieved", data);
      });
    } catch (error) {
      return next(error);
    }
  },
  updateMember: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }
    try {
      Members.findOneAndUpdate(
        { _id: req.params.member_id },
        {
          $set: {
            name: req.body.name,
            idMember: req.body.idMember
          }
        },
        { new: true },
        (err, memberData) => {
          if (err) return apiResponse.ErrorResponse(res, err);
          return apiResponse.successResponseWithData(
            res,
            "Member updated succesfully.",
            memberData
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },
  changePassword: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }
    try {
      const isMatch = await Members.findOne({
        _id: req.params.member_id,
        isDelete: false
      }).select(["-__v"]);
      if (!isMatch)
        return apiResponse.ErrorResponse(
          res,
          "Member ID not found / Member has been deleted"
        );
      console.log(req.body.old_password + " | " + isMatch.password);
      let passMatch = await bcrypt.compare(
        req.body.old_password,
        isMatch.password
      );

      if (!passMatch)
        return apiResponse.ErrorResponse(res, "old password dont match");
      const salt = await bcrypt.genSalt(10);
      var pass = await bcrypt.hash(req.body.new_password, salt);
      console.log(pass);
      await Members.updateOne(
        { _id: req.params.member_id },
        {
          $set: {
            password: pass
          }
        }
      ).then((err, member) => {
        return apiResponse.successResponseWithData(
          res,
          "Member password updated succesfully.",
          member
        );
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },
  deleteMember: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }
    try {
      Members.findOneAndUpdate(
        { _id: req.params.member_id },
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
            "Member deleted successfully"
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = MembersController;
