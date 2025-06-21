import FavoriteJob from "../models/favoriteJob.model.js";

const dataResponse = (code, message, payload) => {
  return {
    code,
    message, 
    payload
  };
};

// Add job to favorites
export const addToFavorites = async (userId, jobId) => {
  try {
    const favorite = await FavoriteJob.create({
      user: userId,
      job: jobId
    });

    const populatedFavorite = await FavoriteJob.findById(favorite._id)
      .populate("job", "title company")
      .populate("job.company", "companyName");

    return dataResponse(201, "Job added to favorites", populatedFavorite);
  } catch (error) {
    if (error.code === 11000) {
      return dataResponse(400, "Job already in favorites", null);
    }
    return dataResponse(500, error.message, null);
  }
};

// Get user's favorite jobs
export const getFavoriteJobs = async (userId) => {
  try {
    const favorites = await FavoriteJob.find({ user: userId })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "companyName location"
        },
        select: "title description salary location"
      })
      .sort({ createdAt: -1 });

    return dataResponse(200, "Favorite jobs retrieved successfully", favorites);
  } catch (error) {
    return dataResponse(500, error.message, null);
  }
};

// Remove job from favorites
export const removeFromFavorites = async (userId, jobId) => {
  try {
    const result = await FavoriteJob.findOneAndDelete({
      user: userId,
      job: jobId
    });

    if (!result) {
      return dataResponse(404, "Favorite job not found", null);
    }

    return dataResponse(200, "Job removed from favorites", result);
  } catch (error) {
    return dataResponse(500, error.message, null);
  }
};

// Check if a job is favorited
export const checkIsFavorited = async (userId, jobId) => {
  try {
    const favorite = await FavoriteJob.findOne({
      user: userId,
      job: jobId
    });

    return dataResponse(200, "Favorite status retrieved", {
      isFavorited: !!favorite
    });
  } catch (error) {
    return dataResponse(500, error.message, null);
  }
};