const { check } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const Admin = require("../models/admin");
const Menu = require("../models/menu")
// const Projects = require("../models/projects");
// const Transactions = require("../models/transactions");
// const transactions = require("../models/transactions");

exports.validate = method => {
  switch (method) {
    case "register": {
      return [
        check("username")
          // .isInt()
          // .withMessage("Member ID must be number only ")
          // .isLength({ min: 12, max: 12 })
          // .withMessage("Member ID length must be 12")
          .custom(value => {
            return Admin.findOne({ username: value, isDelete: false }).then(
              user => {
                if (user) {
                  return Promise.reject(
                    "A User Already registerd with this username of " + value
                  );
                }
              }
            );
          }),
        check("password")
          .isLength({ min: 8 })
          .withMessage("password must be 8 characters.")
      ];
    }

    case "login": {
      return [
        check("username")
          .not()
          .isEmpty()
          .withMessage("Please enter Username")
          .custom(value => {
            return Admin.findOne({ username: value, isDelete: false }).then(
              async user => {
                if (!user) {
                  return Promise.reject("Username not found");
                }
              }
            );
          }),
        check("password")
          .not()
          .isEmpty()
          .isLength({ min: 8 })
          .withMessage("Min password length is 8")
      ];
    }

    case "menu_id": {
      return [
        check("menu_id")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Menu.findOne({ _id: value }).then(
              async menu => {
                if (!menu) {
                  return Promise.reject(
                    "Menu ID not found / Menu has been deleted"
                  );
                }
              }
            );
          })
      ];
    }

    case "changePass": {
      return [
        check("old_password")
          .not()
          .isEmpty()
          .withMessage("Old Password cannot be empty"),
        check("new_password")
          .not()
          .isEmpty()
          .withMessage("New password cannot be empty"),
        check("member_id")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Admin.findOne({ _id: value, isDelete: false }).then(
              async user => {
                if (!user) {
                  return Promise.reject(
                    "Member ID not found / Member has been deleted"
                  );
                }
              }
            );
          })
      ];
    }

    case "createMenu":{
      return [
        check("title")
          .custom(value => {
            return Menu.findOne({ title: value, isDelete: false }).then(
              user => {
                if (user) {
                  return Promise.reject(
                    "A menu already exists with this name " + value
                  );
                }
              }
            );
          }),
      ]
    }

    case "createTransaction": {
      return [
        check("share")
          .isFloat()
          .withMessage("invalid share, share must be in number"),
        check("value")
          .isFloat()
          .withMessage("invalid value, value must be in number"),
        check("member")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Admin.findOne({ _id: value, isDelete: false }).then(
              async user => {
                if (!user) {
                  return Promise.reject(
                    "Member ID not found / Member has been deleted"
                  );
                }
              }
            );
          }),
        check("project")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Projects.findOne({ _id: value, isDelete: false }).then(
              async user => {
                if (!user) {
                  return Promise.reject(
                    "Project ID not found / Project has been deleted"
                  );
                }
              }
            );
          })
      ];
    }

  }
};
