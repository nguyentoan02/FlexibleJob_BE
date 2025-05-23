import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            ssl: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.log("Dont allow to connect mongo");
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
