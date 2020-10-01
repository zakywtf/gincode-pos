const Menu = require("../models/menu");
// const Projects = require("../models/projects");
const apiResponse = require("../helpers/apiResponse");
const { validationResult, check } = require("express-validator");
const { generate } = require("../middlewares/randGen");
const randomPassword = require("generate-password");
const bcrypt = require("bcrypt");
const { default: async } = require("async");

const MenuController = {
  all: (req, res, next) => {
    try {
      Menu.find()
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err.message);

          if (!data.length){
            return apiResponse.dataNotFoundResponse(
              res,
              "No Menu found"
            );
          }else{
            return apiResponse.successResponseWithData(
              res,
              "Data retrieved",
              data
            );
          }
          
        });
    } catch (error) {
      return next(error);
    }
  },

  getSpecificMenu: async (req, res, next) => {
    try {
      const {menu_id}=req.params
      const errors = await validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }

      Menu.find({ _id: menu_id })
        .populate("member", "_id name")
        .populate("project", "_id project_name target_goal pic")
        .exec((err, data) => {
          if (err) return apiResponse.ErrorResponse(res, err);

          if (!data.length)
            return apiResponse.dataNotFoundResponse(
              res,
              "Menu not found"
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

  addMenus: async (req, res, next) => {
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
  
        if (req.files.pict)
          req.body.pict = uploadedImage.pict[0]["location"];
      }

    var menu_id = await generate();

    try {
        const{title, tags, price, desc, pict}=req.body 
        let menu = new Menu({
            title: title,
            tags: tags,
            price: price,
            desc: desc,
            pict: pict,
            menu_id: menu_id
        });
        menu.save((err, data) => {
        if (err) return apiResponse.ErrorResponse(res, err);
        console.log("success");
        
        return apiResponse.successResponseWithData(
          res,
          "Menu added succesfully.",
          data
        );
      });
    } catch (error) {
      return next(error);
    }
  },

  updateMenu: async (req, res, next) => {
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

      if (req.files.pict)
        req.body.pict = uploadedImage.pict[0]["location"];
    }

    try {
      Menu.findOneAndUpdate(
        { _id: req.params.menu_id },
        req.body,
        { new: true },
        (err, menuData) => {
          if (err) return apiResponse.ErrorResponse(res, err);
          return apiResponse.successResponseWithData(
            res,
            "Menu updated succesfully.",
            menuData
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  },

  deleteMenu: async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        "Validation Error.",
        errors.array()
      );
    }

    try {
      Menu.findOneAndUpdate(
        { _id: req.params.menu_id },
        {
          $set: {
            isDelete: true
          }
        },
        err => {
          if (err)
            return apiResponse.ErrorResponse(
              res,
              "Menu ID not found / Menu has been deleted"
            );
          return apiResponse.successResponse(
            res,
            "Menu deleted successfully"
          );
        }
      );
    } catch (error) {
      return next(error);
    }
  }

};

module.exports = MenuController;
