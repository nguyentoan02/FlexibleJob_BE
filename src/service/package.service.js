import Package from "../models/package.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const getAllPackages = async () => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        return dataResponse(200, "Lấy danh sách packages thành công", packages);
    } catch (error) {
        return dataResponse(500, "Lỗi server", null);
    }
};

export const createPackage = async (packageData) => {
    try {
        const newPackage = new Package(packageData);
        await newPackage.save();
        return dataResponse(201, "Tạo package thành công", newPackage);
    } catch (error) {
        return dataResponse(500, "Lỗi server", null);
    }
};

export const updatePackage = async (packageId, updateData) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            updateData,
            { new: true }
        );
        
        if (!updatedPackage) {
            return dataResponse(404, "Package không tồn tại", null);
        }
        
        return dataResponse(200, "Cập nhật package thành công", updatedPackage);
    } catch (error) {
        return dataResponse(500, "Lỗi server", null);
    }
};

export const deletePackage = async (packageId) => {
    try {
        const deletedPackage = await Package.findByIdAndDelete(packageId);
        
        if (!deletedPackage) {
            return dataResponse(404, "Package không tồn tại", null);
        }
        
        return dataResponse(200, "Xóa package thành công", deletedPackage);
    } catch (error) {
        return dataResponse(500, "Lỗi server", null);
    }
}; 