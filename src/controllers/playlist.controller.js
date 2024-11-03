import mongoose, {isValidObjectId, Schema} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name || !description) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist) {
        throw new ApiError(400, "Something went wrong while creating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID format")
    };

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video_details",
                pipeline: [
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
                                        fullName: 1,
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
                            fullName: 1,
                            avatar: 1
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
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                video_details: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
        
    ])

    // console.log(`Playlists of user :: ${JSON.stringify(playlists)}`)

    if(!playlists) {
        throw new ApiError(400, "User's playlists not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "User's playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid video ID format");
    };

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video_details",
                pipeline: [
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
                ]
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
                            fullName: 1,
                            avatar: 1
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
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                video_details: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
    ])

    if(!playlist){
        throw new ApiError(400, "Playlist does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid ID format")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { // Prevents duplicate video entries
                video: videoId
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist) {
        throw new ApiError(400, "Something went wrong while adding video to playlist")
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added into playlist successfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!(isValidObjectId(playlistId) && isValidObjectId(videoId))){
        throw new ApiError(400, "Invalid ID format")
    };

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                video: videoId
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format")
    };

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedPlaylist,
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID format")
    };

    if(!name || !description) {
        throw new ApiError(400, "Name and Description are required")
    };

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
