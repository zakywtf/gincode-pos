const { check } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const Members = require("../models/members");
const Projects = require("../models/projects");
const Transactions = require("../models/transactions");
const transactions = require("../models/transactions");

exports.validate = method => {
  switch (method) {
    case "register": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty"),
        check("idMember")
          .isInt()
          .withMessage("Member ID must be number only ")
          .isLength({ min: 12, max: 12 })
          .withMessage("Member ID length must be 12")
          .custom(value => {
            return Members.findOne({ idMember: value, isDelete: false }).then(
              user => {
                if (user) {
                  return Promise.reject(
                    "A User Already registerd with this id number of " + value
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
        check("idMember")
          .not()
          .isEmpty()
          .withMessage("Please enter Member ID")
          .isInt()
          .withMessage("Member ID must be numeric")
          .isLength({ min: 12, max: 12 })
          .withMessage("Member ID length must be 12")
          .custom(value => {
            return Members.findOne({ idMember: value, isDelete: false }).then(
              async user => {
                if (!user) {
                  return Promise.reject("Member ID not found");
                }
              }
            );
          }),
        check("password")
          .not()
          .isEmpty()
          .isLength({ min: 6 })
          .withMessage("Min password length is 6")
      ];
    }

    case "member_id": {
      return [
        check("member_id")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Members.findOne({ _id: value, isDelete: false }).then(
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

    case "transaction_id": {
      return [
        check("transaction_id")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Transactions.findOne({ _id: value }).then(
              async transaction => {
                if (!transaction) {
                  return Promise.reject(
                    "Transaction ID not found / Transaction has been deleted"
                  );
                }
              }
            );
          })
      ];
    }

    case "project_id": {
      return [
        check("project_id")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Projects.findOne({ _id: value, isDelete: false }).then(
              async project => {
                if (!project) {
                  return Promise.reject(
                    " Project ID not found / Project has been deleted"
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
            return Members.findOne({ _id: value, isDelete: false }).then(
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

    case "createProject": {
      return [
        check("project_name")
          .not()
          .isEmpty()
          .withMessage("Project Name cannot be empty"),
        check("project_profile")
          .not()
          .isEmpty()
          .withMessage("Project Profile cannot be empty"),
        check("project_category")
          .not()
          .isEmpty()
          .withMessage("Project Category cannot be empty"),
        check("deadline")
          .not()
          .isISO8601()
          .withMessage(
            "Deadline date must follow the standard ISO 8601 (YYYY/MM/DD)"
          ),
        check("pic")
          .not()
          .isEmpty()
          .withMessage("PIC cannot be empty"),
        check("target_goal")
          .isInt()
          .withMessage("invalid target goal"),
        check("project_owner")
          .isMongoId()
          .withMessage("Invalid MongoID")
          .custom(value => {
            return Members.findOne({ _id: value, isDelete: false }).then(
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
            return Members.findOne({ _id: value, isDelete: false }).then(
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

    case "sponsorRegistration": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty")
      ];
    }

    case "boardRegistration": {
      return [
        check("member_id")
          .not()
          .isEmpty()
          .withMessage("Member Object ID is required")
          .custom(value => {
            return Members.findOne({ _id: value }).then(user => {
              if (!user) {
                return Promise.reject("Member not found");
              }
            });
          })
      ];
    }

    case "eventRegistration": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty"),
        check("banner")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Banner cannot be empty"),
        check("thumbnail")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Thumbnail cannot be empty")
      ];
    }

    case "eventCategoriesRegistration": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty")
      ];
    }

    case "sponsorsRegistration": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty")
      ];
    }

    case "partnershipsRegistration": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty")
      ];
    }

    case "memberBusinessRegistration": {
      return [
        check("name")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Name cannot be empty"),
        check("city")
          .isLength({ min: 3 })
          .trim()
          .withMessage("City cannot be empty"),
        check("business_category")
          .isLength({ min: 3 })
          .trim()
          .withMessage("Business category cannot be empty")
      ];
    }
  }
};
