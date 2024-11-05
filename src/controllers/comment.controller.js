import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID format")
    }

    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "All fields are required")
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!newComment) {
        throw new ApiError(500, "Something went wrong while creating the comment"); 
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newComment,
            "Comment created successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID format")
    }

    const {content} = req.body

    if(!content) {
        throw new ApiError(400, "All fields are required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!updatedComment) {
        throw new ApiError(400, "Comment does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID format")
    }

    const deletedComment = await Comment.findByIdAndDelete(
        commentId,
    )

    if(!deletedComment) {
        throw new ApiError(400, "Comment does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
