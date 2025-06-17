// src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm uploadImageToCloudinary (giữ nguyên, chỉ dùng cho ảnh)
export const uploadImageToCloudinary = async (fileBuffer, originalname) => {
    try {
        if (!fileBuffer || !originalname) {
            throw new Error(
                "File buffer and original name are required for Cloudinary upload."
            );
        }
        const dataUri = `data:image/jpeg;base64,${fileBuffer.toString(
            "base64"
        )}`; // Giả định là JPEG
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "user_profiles",
        });
        return result;
    } catch (error) {
        console.error("Cloudinary image upload error:", error);
        throw new Error(
            "Failed to upload image to Cloudinary: " + error.message
        );
    }
};

/**
 * Tải lên một file bất kỳ (dạng buffer) lên Cloudinary.
 * Đã thêm tham số resourceType để xử lý các loại file khác nhau (raw cho PDF).
 * @param {Buffer} fileBuffer - Buffer của file cần tải lên.
 * @param {string} folder - Tên thư mục trên Cloudinary.
 * @param {string} resourceType - Loại tài nguyên ('image', 'video', 'raw', 'auto').
 * @returns {Promise<Object>} - Một Promise giải quyết với kết quả tải lên từ Cloudinary.
 */
export const uploadToCloudinary = (
    fileBuffer,
    folder,
    resourceType = "auto",
    additionalOptions = {}
) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type: resourceType,
            ...additionalOptions,
        };

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    console.error("Cloudinary upload stream error:", error);
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

/**
 * Hàm tiện ích chuyên biệt để tải lên file PDF lên Cloudinary.
 * Luôn gọi uploadToCloudinary với resource_type: 'raw'.
 * @param {Buffer} fileBuffer - Buffer của file PDF.
 * @param {string} originalname - Tên gốc của file PDF.
 * @returns {Promise<Object>} - Kết quả upload từ Cloudinary.
 */
export const uploadPdfToCloudinary = async (fileBuffer, originalname) => {
    try {
        if (!fileBuffer || !originalname) {
            throw new Error(
                "File buffer and original name are required for PDF upload."
            );
        }

        // Xử lý tên file - loại bỏ .pdf nếu có và các ký tự đặc biệt
        const cleanFileName = originalname
            .toLowerCase()
            .replace(/\.pdf$/, '')  // remove .pdf extension
            .replace(/[^a-z0-9]/g, '_'); // replace special chars with underscore

        // Upload với resource_type là 'raw' và thêm các options cần thiết
        const result = await uploadToCloudinary(fileBuffer, "user_cvs", "raw", {
            public_id: cleanFileName, // Sử dụng tên file gốc đã được làm sạch
            format: 'pdf',
            resource_type: 'raw',
            use_filename: true,
            unique_filename: false, // Set false để không thêm string random
            overwrite: true // Cho phép ghi đè file cũ nếu trùng tên
        });

        return result;
    } catch (error) {
        console.error("Cloudinary PDF upload error:", error);
        throw new Error("Failed to upload PDF to Cloudinary: " + error.message);
    }
};
