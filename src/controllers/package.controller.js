import { 
    getAllPackages, 
    createPackage, 
    updatePackage, 
    deletePackage
} from "../service/package.service.js";

function toBoolean(val) {
    return val === true || val === "true" || val === 1 || val === "1" || val === "on";
}

// Lấy tất cả packages
export const getAllPackagesController = async (req, res) => {
    const result = await getAllPackages();
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Tạo package mới
export const createPackageController = async (req, res) => {
    let { name, price, description, benefits, isPopular, isActive } = req.body;
    
    // Ép kiểu isActive và isPopular sang boolean nếu có
    if (typeof isActive !== "undefined") {
        isActive = toBoolean(isActive);
    }
    if (typeof isPopular !== "undefined") {
        isPopular = toBoolean(isPopular);
    }
    
    const packageData = {
        name,
        price,
        description,
        benefits,
        isPopular,
        isActive,
    };
    
    const result = await createPackage(packageData);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Cập nhật package
export const updatePackageController = async (req, res) => {
    const { packageId } = req.params;
    let updateData = req.body;
    
    // Ép kiểu isActive và isPopular sang boolean nếu có
    if (typeof updateData.isActive !== "undefined") {
        updateData.isActive = toBoolean(updateData.isActive);
    }
    if (typeof updateData.isPopular !== "undefined") {
        updateData.isPopular = toBoolean(updateData.isPopular);
    }
    
    const result = await updatePackage(packageId, updateData);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};

// Xóa package
export const deletePackageController = async (req, res) => {
    const { packageId } = req.params;
    
    const result = await deletePackage(packageId);
    res.status(result.code).json({
        message: result.message,
        payload: result.payload,
    });
};