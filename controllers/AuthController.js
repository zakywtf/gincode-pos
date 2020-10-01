const Members = require("../models/members");
const { check, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const async = require("async");
const jwt = require("jsonwebtoken");
const isAdmin = require("../middlewares/adminCheck");

const AuthController = {
  register: async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      const { name, idMember, password } = req.body;

      let passwordHash = await bcrypt.hash(password,10);

      let member = new Members({
        name,
        idMember,
        password: passwordHash
      });

      member.save((err, user) => {
        if (err) return apiResponse.ErrorResponse(res, err);

        let userData = {
          name: user.name,
          email: user.idMember,
          password: password
        };

        return apiResponse.successResponseWithData(
          res,
          "Registration Success.",
          userData
        );
      });
    } catch (error) {
      return apiResponse.ErrorResponseWithData(res, "Server Error", error);
    }
  },
  login: async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      let member = await Members.findOne({
        idMember: req.body.idMember,
        isDelete: false
      });

      if (!member)
        return apiResponse.unauthorizedResponse(res, "Member ID not found");

      const isMatch = await bcrypt.compare(req.body.password, member.password);

      if (!isMatch)
        return apiResponse.unauthorizedResponse(res, "Incorrect password");

      let memberData = {
        _id: member._id,
        name: member.name,
        idMember: member.idMember,
        isAdmin: member.isAdmin
      };

      //Prepare JWT token for authentication
      const secret = process.env.JWT_SECRET;
      const jwtPayload = memberData;
      const jwtData = {
        expiresIn: process.env.JWT_TIMEOUT_DURATION
      };

      //Generated JWT token with Payload and secret.
      memberData.token = jwt.sign(jwtPayload, secret, jwtData);

      return apiResponse.successResponseWithData(
        res,
        "Login Success.",
        memberData
      );
    } catch (error) {
      return apiResponse.ErrorResponseWithData(res, "Server Error", error);
    }
  }
};

module.exports = AuthController;
