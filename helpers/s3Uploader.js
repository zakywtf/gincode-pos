const AWS = require('aws-sdk');
const multer = require("multer");
const multerS3 = require("multer-s3");

//configuring the AWS environment
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    params: {
        ACL: 'public-read',
        Bucket: process.env.AWS_S3_BUCKET
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname == 'proof_of_payment') {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") { // check file type to be pdf, doc, or docx
            cb(null, true);
        } else {
            cb(new Error("Invalid file type, only PDF or JPG/PNG is allowed"), false);
        }
    } else {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
        }
    }
};

const uploadS3 = multer({
    fileFilter,
    storage: multerS3({
        acl: "public-read",
        s3,
        bucket: process.env.AWS_S3_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname
            });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '_' + file.originalname);
        },
    }),
    limits: {
        fileSize: 2000000
    }
}).fields([
    {
        name: 'proof_of_payment',
        maxCount: 1
    },
    {
        name: 'banner_project',
        maxCount: 1
    },
    {
        name: 'pict',
        maxCount: 1
    }
]);

module.exports = uploadS3;