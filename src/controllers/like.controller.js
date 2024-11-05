import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

   const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
   })

   if(existingLike){
    await existingLike.remove()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Video unliked successfully"
        )
    )
   }else{
    const newLikedVideo = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    if(!newLikedVideo) {
        throw new ApiError(400, "Something went wrong while liking the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Video liked successfully"
        )
    )
   }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID format")
    }

   const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id
   })

   if(existingLike){
    await existingLike.remove()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Comment unliked successfully"
        )
    )
   }else{
    const newLikedComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(!newLikedComment) {
        throw new ApiError(400, "Something went wrong while liking the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Comment liked successfully"
        )
    )
   }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID format")
    }

   const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id
   })

   if(existingLike){
    await existingLike.remove()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Tweet unliked successfully"
        )
    )
   }else{
    const newLikedTweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if(!newLikedTweet) {
        throw new ApiError(400, "Something went wrong while liking the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Tweet liked successfully"
        )
    )
   }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideo = await Like.aggregate([
        {
            $match: {
                video: {
                    $exists: true // Ensures the document has a "video" field
                }
            }
        },
        {
            $group: {
                _id: "$video",
                likeCount: {
                    $sum: 1
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "owner",
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
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },
        {
            $project: {
                _id: 0,
                likeCount: 1,
                video: 1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideo,
            "All liked video fetched successfully"
        )
    )


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}