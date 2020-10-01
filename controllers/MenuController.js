const Menu = require("../models/menu");
const Projects = require("../models/projects");
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
  }
};

module.exports = MenuController;
