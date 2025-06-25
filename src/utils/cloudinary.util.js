import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
// import fs from 'fs'; // NEW: Không cần import fs nữa vì không ghi file tạm thời

dotenv.config(); // Đảm bảo các biến môi trường được load

// Cấu hình Cloudinary SDK
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Tải lên một file ảnh (dạng buffer) lên Cloudinary.
 * @param {Buffer} fileBuffer - Buffer của file ảnh cần tải lên.
 * @param {string} originalname - Tên gốc của file (dùng để Cloudinary nhận diện loại file).
 * @returns {Promise<Object>} - Một Promise giải quyết với kết quả tải lên từ Cloudinary.
 */
export const uploadImageToCloudinary = async (fileBuffer, originalname) => {
    try {
        if (!fileBuffer || !originalname) {
            throw new Error(
                "File buffer and original name are required for Cloudinary upload."
            );
        }

        // NEW: Chuyển đổi buffer sang định dạng data URI
        const dataUri = `data:image/jpeg;base64,${fileBuffer.toString(
            "base64"
        )}`; // Thay 'image/jpeg' bằng loại MIME phù hợp nếu bạn có thể lấy từ file.mimetype

        // Tải lên file lên Cloudinary từ data URI
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "user_profiles", // Thư mục lưu trữ ảnh trên Cloudinary
            // optional: public_id: originalname.split('.')[0] // Nếu muốn đặt tên public_id theo tên file gốc
        });

        return result; // Trả về kết quả upload từ Cloudinary
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(
            "Failed to upload image to Cloudinary: " + error.message
        );
    }
};

export const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};
