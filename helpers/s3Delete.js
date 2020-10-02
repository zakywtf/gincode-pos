const AWS = require('aws-sdk');
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

// const deleteS3 = (key)=> {
//     const params={
//         Bucket: process.env.AWS_S3_BUCKET,
//         Key:key
//     }
//     return new Promise((resolve,rej)=>{
//         s3.deleteObject(params, function (err, res) {
//             if (err) {
//                 console.log("error delete image");
//                 rej(err)
//             }
//             else {
//                 console.log("success delete image");
//                 resolve()
//              }
//         });        
//     })
// };

const deleteS3 = (key) =>{
    const params={
        Bucket: process.env.AWS_S3_BUCKET,
        Key:key
    }
    return new Promise((resolve, reject) => {
        s3.createBucket({
            Bucket: process.env.AWS_S3_BUCKET
        }, function () {
            s3.deleteObject(params, function (err, data) {
                if (err) console.log(err);
                else
                    console.log("Successfully deleted file from bucket");
                console.log(data);
            });
        });
    });
};

module.exports = deleteS3