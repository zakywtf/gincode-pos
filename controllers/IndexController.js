const apiResponse = require("../helpers/apiResponse");
const s3 = require("../helpers/s3Uploader");
const Members = require("../models/members");

const IndexController = {
    index: (req, res) => {
        res.redirect(301, 'https://idenyata.com/')
    },
    ping: (req, res) => {
        return apiResponse.successResponse(res, 'Pong');
    }
}

module.exports = IndexController;