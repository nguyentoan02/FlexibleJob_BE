import { searchJobs } from "../service/searchJob.service.js";

export const searchJobsController = async (req, res) => {
    try {
        const {
            title,
            location,
            experienceYears,
            level,
            jobType,
            page = 1,
            limit = 10,
        } = req.query;

        const searchParams = {
            title,
            location,
            experienceYears,
            level,
            jobType,
        };

        const result = await searchJobs(
            searchParams,
            parseInt(page),
            parseInt(limit)
        );

        res.status(result.code).json({
            message: result.message,
            payload: result.payload,
        });
    } catch (error) {
        console.error("Error in searchJobsController:", error);
        res.status(500).json({
            message: "Internal server error",
            payload: null,
        });
    }
};
