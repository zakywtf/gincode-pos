const Admin = require("../models/admin");
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
      const { username, name, password } = req.body;

      let passwordHash = await bcrypt.hash(password,10);

      let admin = new Admin({
        username,
        name,
        password: passwordHash
      });

      admin.save((err, user) => {
        if (err) return apiResponse.ErrorResponse(res, err);

        let userData = {
          username: user.username,
          name: user.name,
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
      const { username, password } = req.body;

      let admin = await Admin.findOne({
        username: username,
        isDelete: false
      });

      if (!admin)
        return apiResponse.unauthorizedResponse(res, "Admin ID not found");

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch)
        return apiResponse.unauthorizedResponse(res, "Incorrect password");

      let adminData = {
        _id: admin._id,
        username: admin.username,
        name: admin.name,
        isAdmin: admin.isAdmin
      };

      //Prepare JWT token for authentication
      const secret = process.env.JWT_SECRET;
      const jwtPayload = adminData;
      const jwtData = {
        expiresIn: process.env.JWT_TIMEOUT_DURATION
      };

      //Generated JWT token with Payload and secret.
      adminData.token = jwt.sign(jwtPayload, secret, jwtData);

      return apiResponse.successResponseWithData(
        res,
        "Login Success.",
        adminData
      );
    } catch (error) {
      return apiResponse.ErrorResponseWithData(res, "Server Error", error);
    }
  }
};

module.exports = AuthController;
