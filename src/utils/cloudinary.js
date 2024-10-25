import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const getPublicId = (url) => {
    const splitUrl = url.split("/")
    return splitUrl[splitUrl.length-1].split(".")[0]
}


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfully

        // console.log("file is uploaded on cloudinary", response.url)

        fs.unlinkSync(localFilePath)

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed

        return null;
    }
}


const deleteImageOnCloudinary = async(public_id) => {
    try {
        if(!public_id) return null

        await cloudinary.uploader.destroy(public_id, {resource_type: "image"})

    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Something went wrong while deleting image on cloudinary"
        )
    }
}


export {
    uploadOnCloudinary,
    getPublicId,
    deleteImageOnCloudinary,
};