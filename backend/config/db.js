import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("DB connected successfully");
    } catch (error) {
        console.log("DB connection error", error);
        process.exit(1); // Exit process with error
    }
}; 

export default connectDB; 