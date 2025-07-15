import mongoose from "mongoose";
import {
    companyApprove,
    createCompany,
    getAllCompany,
    getAllInVoices,
    getCompanyByUserId,
    getCompanyProfile,
    getJobStats,
    updateCompanyProfile,
} from "../service/company.service.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import { removeEmptyFields } from "../utils/handleArray.util.js";

export const getCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const result = await getCompanyProfile(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const updateCompany = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = {
            imageUrl: null,
            coverImage: null,
            albumImage: [],
            identityImage: [],
        };

        // Ensure removeImages is always an array
        const imagesToRemove = req.body.removeImages;

        // Xử lý upload ảnh mới
        if (req.files.imageUrl) {
            const file = req.files.imageUrl[0];
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_avatars"
            );
            result.imageUrl = uploaded.secure_url;
        }

        if (req.files.coverImage) {
            const file = req.files.coverImage[0];
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_covers"
            );
            result.coverImage = uploaded.secure_url;
        }

        if (req.files.albumImage) {
            for (const file of req.files.albumImage) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    "Company_albums"
                );
                result.albumImage.push(uploaded.secure_url);
            }
        }

        if (req.files.identityImage) {
            for (const file of req.files.identityImage) {
                const uploaded = await uploadToCloudinary(
                    file.buffer,
                    "Company_identityImage"
                );
                result.identityImage.push(uploaded.secure_url);
            }
        }

        const cleanedImages = removeEmptyFields(result);
        const profileData = {
            ...req.body,
            ...cleanedImages,
            removeImages: imagesToRemove,
        };

        console.log("profile data:", profileData);

        delete profileData._id;
        delete profileData.user;

        const update = await updateCompanyProfile(userId, profileData);
        res.status(update.code).json({
            message: update.message,
            payload: update.payload,
        });
    } catch (error) {
        console.error("Update Company Error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const createCompanyProfile = async (req, res) => {
    const result = {
        imageUrl: null,
        coverImage: null,
        albumImage: [],
        identityImage: [],
    };

    if (req.files.imageUrl) {
        const file = req.files.imageUrl[0];
        const uploaded = await uploadToCloudinary(
            file.buffer,
            "Company_avatars"
        );
        result.imageUrl = uploaded.secure_url;
    }

    if (req.files.coverImage) {
        const file = req.files.coverImage[0];
        const uploaded = await uploadToCloudinary(
            file.buffer,
            "Company_covers"
        );
        result.coverImage = uploaded.secure_url;
    }

    if (req.files.albumImage) {
        for (const file of req.files.albumImage) {
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_albums"
            );
            result.albumImage.push(uploaded.secure_url);
        }
    }

    if (req.files.identityImage) {
        for (const file of req.files.identityImage) {
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_identityImage"
            );
            result.identityImage.push(uploaded.secure_url);
        }
    }

    const data = {
        ...result,
        ...req.body,
        user: req.user.id,
    };

    const company = await createCompany(data);
    res.status(company.code).json({
        message: company.message,
        payload: company.payload,
    });
};

export const getMyCompany = async (req, res) => {
    const userId = req.user.id;
    const result = await getCompanyByUserId(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

import {
    getPendingCompanies,
    updateCompanyApproval,
} from "../service/company.service.js";

export const getPendingCompaniesForAdmin = async (req, res) => {
    const result = await getPendingCompanies();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const approveCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const { isApproved } = req.body;
    const result = await updateCompanyApproval(companyId, isApproved);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const isCompanyApproved = async (req, res) => {
    const userId = req.user.id;
    console.log(userId);
    const result = await companyApprove(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const statsJob = async (req, res) => {
    const userId = req.user.id;
    const result = await getJobStats(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const statsInVoice = async (req, res) => {
    const userId = req.user.id;
    const result = await getAllInVoices(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const getCompanyList = async (req, res) => {
    const result = await getAllCompany();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};
