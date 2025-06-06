import CompanyProfile from "../models/companyprofile.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const getCompanyProfile = async (companyId) => {
    const companyProfile = await CompanyProfile.findById(companyId);
    if (!companyProfile) {
        return dataResponse(404, "can not find this company", null);
    }
    return dataResponse(200, "found", companyProfile);
};

export const updateCompanyProfile = async (userId, data) => {
    try {
        const updatedCompanyProfile = await CompanyProfile.findOneAndUpdate(
            { user: userId },
            { $set: data },
            { new: true }
        );

        if (!updatedCompanyProfile) {
            return dataResponse(404, "Cannot find this company", null);
        }

        return dataResponse(200, "Success", updatedCompanyProfile);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const createCompany = async (data) => {
    try {
        const result = await CompanyProfile.create(data);
        return dataResponse(200, "create success", result);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};

export const getCompanyByUserId = async (userId) => {
    const company = await CompanyProfile.findOne({ user: userId });
    if (!company) {
        return dataResponse(404, "can not find this company profile", null);
    }
    return dataResponse(200, "found company profile", company);
};

export const removeEmptyFields = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => {
            if (value === null || value === undefined) return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
        })
    );
};

export const createCompany = async (
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
    avatar,
    coverImage,
    albumImage,
    identityImage
) => {
    try {
        const result = await CompanyProfile.create({
            companyName: companyName,
            user: userId,
            aboutUs: aboutUs,
            address: address,
            location: location,
            industry: industry,
            companySize: companySize,
            website: website,
            email: email,
            phone: phone,
            linkedinUrl: linkedinUrl,
            facebookUrl: facebookUrl,
            imageUrl: avatar,
            coverImage: coverImage,
            albumImage: albumImage,
            identityImage: identityImage,
        });
        return dataResponse(200, "create success", result);
    } catch (err) {
        return dataResponse(500, err.message, null);
    }
};
