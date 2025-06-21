import {
    addToFavorites,
    getFavoriteJobs,
    removeFromFavorites,
    checkIsFavorited,
} from "../service/favoriteJob.service.js";

export const addJobToFavorites = async (req, res) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    const result = await addToFavorites(userId, jobId);
    res.status(result.code).json(result);
};

export const getMyFavoriteJobs = async (req, res) => {
    const userId = req.user.id;

    const result = await getFavoriteJobs(userId);
    res.status(result.code).json(result);
};

export const removeJobFromFavorites = async (req, res) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    const result = await removeFromFavorites(userId, jobId);
    res.status(result.code).json(result);
};

export const checkJobFavoriteStatus = async (req, res) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    const result = await checkIsFavorited(userId, jobId);
    res.status(result.code).json(result);
};
