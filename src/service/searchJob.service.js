import Job from "../models/jobs.model.js";

const dataResponse = (code, message, payload) => {
    return {
        code: code,
        message: message,
        payload: payload,
    };
};

export const searchJobs = async (searchParams, page = 1, limit = 10) => {
    try {
        const query = { isExpired: false, isHidden: { $ne: true } }; // Thêm điều kiện isHidden

        // Tìm theo title dạng case insensitive
        if (searchParams.title) {
            query.title = { $regex: searchParams.title, $options: "i" };
        }

        // Tìm theo location
        if (searchParams.location) {
            query.location = { $regex: searchParams.location, $options: "i" };
        }

        // Tìm theo experienceYears
        if (searchParams.experienceYears) {
            query.experienceYears = {
                $lte: parseInt(searchParams.experienceYears),
            };
        }

        // Tìm theo level
        if (searchParams.level) {
            query.level = searchParams.level;
        }

        // Tìm theo jobType
        if (searchParams.jobType) {
            query.jobType = searchParams.jobType;
        }

        // Thực hiện tìm kiếm với phân trang
        const jobs = await Job.find(query)
            .populate("company", "companyName location")
            .populate("category", "categoryName")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ datePosted: -1 });

        // Đếm tổng số kết quả để tính số trang
        const totalJobs = await Job.countDocuments(query);

        return dataResponse(200, "Jobs found successfully", {
            jobs,
            totalPages: Math.ceil(totalJobs / limit),
            currentPage: page,
            totalJobs,
        });
    } catch (error) {
        console.error("Error in searchJobs service:", error);
        return dataResponse(500, "Error searching jobs", null);
    }
};
