import cron from "node-cron";
import Job from "../models/jobs.model.js";

cron.schedule("0 0 * * *", async () => {
    try {
        const now = new Date();
        const expiredJobs = await Job.updateMany(
            {
                expiredAt: { $lte: now },
                isExpire: { $ne: true },
            },
            {
                $set: { isExpire: true },
            }
        );

        console.log(`${expiredJobs.modifiedCount} job(s) expired updated.`);
    } catch (error) {
        console.error("Error updating expired jobs:", error);
    }
});
