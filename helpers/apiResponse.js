exports.successResponse = (res, msg) => {
	let data = {
		status: 200,
		message: msg
	};
	return res.status(200).json(data);
};

exports.successResponseWithData = (res, msg, data) => {
	let resData = {
		status: 200,
		message: msg,
		data: data
	};
	return res.status(200).json(resData);
};

exports.dataNotFoundResponse = (res, msg) => {
	let data = {
		status: 204,
		message: msg
	};
	return res.status(200).json(data);
};

exports.ErrorResponse = (res, msg) => {
	let data = {
		status: 500,
		message: msg,
	};
	return res.status(500).json(data);
};

exports.ErrorResponseWithData = (res, msg, data) => {
	let resData = {
		status: 500,
		message: msg,
		data: data
	};
	return res.status(500).json(resData);
};

exports.notFoundResponse = (res, msg) => {
	let data = {
		status: 404,
		message: msg,
	};
	return res.status(404).json(data);
};

exports.validationError = (res, msg) => {
	let resData = {
		status: 400,
		message: msg,
	};
	return res.status(400).json(resData);
};

exports.validationErrorWithData = (res, msg, data) => {
	let resData = {
		status: 400,
		message: msg,
		data: data
	};
	return res.status(400).json(resData);
};

exports.unauthorizedResponse = (res, msg) => {
	let data = {
		status: 401,
		message: msg,
	};
	return res.status(401).json(data);
};