import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, getPublicId, deleteMediaOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description) {
        throw new ApiError(400, "Title and Description are required")
    }

    // Extract video and thumbnail from user
    const videoLocalPath = req.files?.videoFile[0].path
    const thumbnailLocalPath = req.files?.thumbnail[0].path

    if(!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "videoFile and thumbnail are required")
    }

    // upload on cloudinary

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video || !thumbnail) {
        throw new ApiError(400, "videoFile and thumbnail are required")
    }

    // console.log(`Video output after uploading on cloudinary :: ${JSON.stringify(video)}`)

    // create video 

    const videoDocument = await Video.create({
        videoFile: video?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: video?.duration,
        owner: req.user?._id
    })

    if(!videoDocument) {
        throw new ApiError(400, "Something went wrong while uploading the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videoDocument,
            "Video uploaded successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if(!video) {
        throw new ApiError(400, "Video does not exists")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    const {title, description} = req.body

    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    // console.log(`req.file :: ${JSON.stringify(req.file)}`)
    const thumbnailLocalPath = req.file?.path

    // console.log(`thumbnail-localPath :: ${thumbnailLocalPath}`)

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is missing")
    }

    // upload on cloudinary

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail");
    }

    // find video document by id

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, "video does not exists")
    }

    // delete old thumbnail from cloudinary

    const oldThumbnailUrl = video?.thumbnail
    if(!oldThumbnailUrl){
        throw new ApiError(400, "Thumbnail does not exists in video")
    }

    const public_id = getPublicId(oldThumbnailUrl)

    if(!public_id) {
        throw new ApiError(400, "Something went wrong while generating thumbnail public_Id")
    }

    await deleteMediaOnCloudinary(public_id);

    // find video document by id and update the thumbnail, title, and description
    const videoDocument = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail?.url,
                title,
                description,
            }
        },
        { new: true }
    )


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videoDocument,
            "Video updated successfully"
        )
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo) {
        throw new ApiError(400, "Video not found")
    }

    const thumbnailUrl = deletedVideo?.thumbnail
    const videoUrl = deletedVideo?.videoFile

    if(!thumbnailUrl || !videoUrl) {
        throw new ApiError(400, "thumbnail and videoFile are missing from video")
    }

    const thumbnailPublicId = getPublicId(thumbnailUrl)
    const videoFilePublicId = getPublicId(videoUrl)

    await deleteMediaOnCloudinary(thumbnailPublicId)
    await deleteMediaOnCloudinary(videoFilePublicId,"video")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedVideo,
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, "Vidoe does not exists")
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                isPublished: video.isPublished
            },
            "Vidoe's isPublished toggled successfully"
        )
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
