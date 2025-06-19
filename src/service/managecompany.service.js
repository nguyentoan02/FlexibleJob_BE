import CompanyProfile from "../models/companyprofile.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";

const dataResponse = (code, message, payload) => {
    return {
        code,
        message,
        payload,
    };
};

// [CREATE] Tạo mới công ty
export const createCompany = async (userId, data, files) => {
    try {
        // Kiểm tra xem user đã có company chưa
        const existingCompany = await CompanyProfile.findOne({ user: userId });
        if (existingCompany) {
            return dataResponse(
                400,
                "User already has a company profile",
                null
            );
        }

        const result = {
            imageUrl: null,
            coverImage: null,
            albumImage: [],
        };

        // Upload ảnh đại diện
        if (files.imageUrl) {
            const uploaded = await uploadToCloudinary(
                files.imageUrl[0].buffer,
                "Company_avatars"
            );
            result.imageUrl = uploaded.secure_url;
        }

        // Upload ảnh nền
        if (files.coverImage) {
            const uploaded = await uploadToCloudinary(
                files.coverImage[0].buffer,
                "Company_covers"
            );
            result.coverImage = uploaded.secure_url;
        }

        // Upload album ảnh
        if (files.albumImage) {
            for (const file of files.albumImage) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    "Company_albums"
                );
                result.albumImage.push(uploaded.secure_url);
            }
        }

        const companyData = {
            ...data,
            ...result,
            user: userId,
        };

        const company = await CompanyProfile.create(companyData);
        return dataResponse(201, "Company created successfully", company);
    } catch (error) {
        console.error("Error in createCompany service:", error);
        return dataResponse(500, "Failed to create company", null);
    }
};

// [READ] Lấy thông tin công ty của user
export const getCompanyByUserId = async (userId) => {
    try {
        const company = await CompanyProfile.findOne({ user: userId }).populate(
            "user",
            "firstName lastName email"
        );
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }
        return dataResponse(200, "Company fetched successfully", company);
    } catch (error) {
        console.error("Error in getCompanyByUserId service:", error);
        return dataResponse(500, "Failed to fetch company", null);
    }
};

// [UPDATE] Cập nhật thông tin công ty của user
export const updateCompanyByUserId = async (userId, data, files) => {
    try {
        const company = await CompanyProfile.findOne({ user: userId });
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }

        const result = {
            imageUrl: company.imageUrl,
            coverImage: company.coverImage,
            albumImage: [...company.albumImage],
        };

        // Upload ảnh đại diện mới
        if (files.imageUrl) {
            const uploaded = await uploadToCloudinary(
                files.imageUrl[0].buffer,
                "Company_avatars"
            );
            result.imageUrl = uploaded.secure_url;
        }

        // Upload ảnh nền mới
        if (files.coverImage) {
            const uploaded = await uploadToCloudinary(
                files.coverImage[0].buffer,
                "Company_covers"
            );
            result.coverImage = uploaded.secure_url;
        }

        // Upload thêm ảnh vào album
        if (files.albumImage) {
            for (const file of files.albumImage) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    "Company_albums"
                );
                result.albumImage.push(uploaded.secure_url);
            }
        }

        // Xóa ảnh khỏi album nếu có yêu cầu
        if (data.removeImages) {
            result.albumImage = result.albumImage.filter(
                (img) => !data.removeImages.includes(img)
            );
        }

        const updatedData = {
            ...data,
            ...result,
        };

        const updatedCompany = await CompanyProfile.findOneAndUpdate(
            { user: userId },
            updatedData,
            { new: true }
        );

        return dataResponse(
            200,
            "Company updated successfully",
            updatedCompany
        );
    } catch (error) {
        console.error("Error in updateCompanyByUserId service:", error);
        return dataResponse(500, "Failed to update company", null);
    }
};

// [DELETE] Xóa công ty của user
export const deleteCompanyByUserId = async (userId) => {
    try {
        const company = await CompanyProfile.findOneAndDelete({ user: userId });
        if (!company) {
            return dataResponse(404, "Company not found", null);
        }
        return dataResponse(200, "Company deleted successfully", null);
    } catch (error) {
        console.error("Error in deleteCompanyByUserId service:", error);
        return dataResponse(500, "Failed to delete company", null);
    }
};
