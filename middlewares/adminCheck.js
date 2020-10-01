const apiResponse = require("../helpers/apiResponse");

const isAdmin = (req, res, next) => {
    if(!req.user.isAdmin) {
        return apiResponse.unauthorizedResponse(res, 'Unauthorized. Only admin is allowed');
    }

    next();
}

module.exports = isAdmin;