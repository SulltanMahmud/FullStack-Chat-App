import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv"; //import for acceess secret key from env file

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// upload image show from cloudinary bucket
