import {
    createCompany,
    getCompanyByUserId,
    getCompanyProfile,
    removeEmptyFields,
    updateCompanyProfile,
} from "../service/company.service.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";

export const getCompanyById = async (req, res) => {
    const { companyId } = req.params;
    const result = await getCompanyProfile(companyId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const updateCompany = async (req, res) => {
    const userId = req.user.id;
    console.log(req.user);
    const result = {
        imageUrl: null,
        coverImage: null,
        albumImage: [],
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
    const cleanedImages = removeEmptyFields(result);
    const profileData = {
        ...req.body,
        ...cleanedImages,
    };

    const update = await updateCompanyProfile(userId, profileData);
    res.status(update.code).json({
        message: update.message,
        payload: update.payload,
    });
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
        for (const file of req.files.albumImage) {
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
    const { userId } = req.userId;
    const result = await getCompanyByUserId(userId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

export const createCompanyProfile = async (req, res) => {
    const {
        companyName,
        userId,
        aboutUs,
        address,
        location,
        industry,
        companySize,
        website,
        email,
        phone,
        linkedinUrl,
        facebookUrl,
    } = req.body;

    const result = {
        avatar: null,
        coverImage: null,
        albumImage: [],
        identityImage: [],
    };

    if (req.files.avatar) {
        const file = req.files.avatar[0];
        const uploaded = await uploadToCloudinary(
            file.buffer,
            "Company_avatars"
        );
        result.avatar = uploaded.secure_url;
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
        for (const file of req.files.albumImage) {
            const uploaded = await uploadToCloudinary(
                file.buffer,
                "Company_identityImage"
            );
            result.identityImage.push(uploaded.secure_url);
        }
    }

    const company = await createCompany(
        companyName,
        userId,
        aboutUs,
        address,
        location,
        industry,
        companySize,
        website,
        email,
        phone,
        linkedinUrl,
        facebookUrl,
        result.avatar,
        result.coverImage,
        result.albumImage,
        result.identityImage
    );
    res.status(company.code).json({
        message: company.message,
        payload: company.payload,
    });
};
