import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID format")
    }

    if(channelId === req.user?._id) {
        throw new ApiError(400, "Cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    })

    // console.log(existingSubscription)

    if(existingSubscription){
        await existingSubscription.deleteOne();

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Channel Unsubscribed successfully"
            )
        )
    }else {
        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        if(!newSubscription) {
            throw new ApiError(500, "Something went wrong while creating subscription")
        }


        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Channel subscribed successfully"
            )
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
// console.log(channelId)
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id format");
    };

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "subscriber",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscribers"
        },
        {
            $group: {
                _id: null,
                subscribers: {
                    $push: "$subscribers"
                },
                subscribersCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                subscribersCount: 1,
                subscribers: 1
            }
        }
    ])

    if(!subscriberList){
        throw new ApiError(400, "Channel does not have any subscribers")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscriberList,
            "Subscriber list fetched successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID format");
    };

    const channelList = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId) 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel_details",
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
            $unwind: "$channel_details"
        },
        {
            $group: {
                _id: null,
                channel_details: {
                    $push: "$channel_details"
                },
                subscribedChannels: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                subscribedChannels: 1,
                channel_details: 1
            }
        }
    ])

    if(!channelList){
        throw new ApiError(404, "User don't subscribed any channel")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channelList,
            "Channel list fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}