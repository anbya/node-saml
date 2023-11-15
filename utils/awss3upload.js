const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const fs = require("fs")

exports.awsUpload = async (req, res, next) => {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials:{
            accessKeyId:process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
        }
    })
    const bucketName = process.env.AWS_BUCKET_NAME

    const fileName = req.file.filename
    const filePath = req.file.path

    const fileContent = fs.readFileSync(filePath)

    const params = {
        Bucket:bucketName,
        Key:fileName,
        Body:fileContent
    }
    try {
        const data = await s3Client.send(new PutObjectCommand(params))
        console.log(`File uploaded to S3`, data);
        next()
    } catch(err) {
        console.log(err);
        next()
    }
};

