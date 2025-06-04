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

export const updateCompanyProfile = async (companyId, companyProfile) => {
    const updatedCompanyProfile = await CompanyProfile.findByIdAndUpdate(
        companyId,
        companyProfile
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
