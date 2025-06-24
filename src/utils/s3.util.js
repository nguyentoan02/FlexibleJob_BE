import AWS from "aws-sdk";

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const uploadPdfToS3 = async (fileBuffer, originalname) => {
    // Tạo tên file duy nhất với timestamp
    const fileName = `${Date.now()}_${originalname}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `user_cvs/${fileName}`, // Sử dụng fileName đã tạo
        Body: fileBuffer,
        ContentType: "application/pdf",
        // THÊM DÒNG NÀY ĐỂ BUỘC TRÌNH DUYỆT TẢI XUỐNG
        ContentDisposition: `attachment; filename="${originalname}"`,
    };

    const data = await s3.upload(params).promise();
    return data.Location; // Trả về URL file trên S3
};
