import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists : username, email
  // check for images , check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // if yes, return response

  // Extract info from req.body
  const { fullName, email, username, password } = req.body;

  console.log("email: ", email);

  // perform validation
  // The some() method checks if any of the fields (fullName, email, username, or password) is empty (i.e., it contains only whitespace).
  // If at least one field is empty, some() returns true, and an error is thrown.
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check user is exists or not

  /*
  In MongoDB, this query translates to:
  { 
    "$or": [
      { "username": "<value_from_req.body.username>" }, 
      { "email": "<value_from_req.body.email>" }
    ] 
  }

  1. If either username or email exists in the database, the first matching document will be returned.
  2. If no matching user is found, findOne() will return null.
  3. $or: This is a MongoDB operator that allows you to specify multiple conditions. It will return documents that match at least one of the specified conditions.
  */

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) throw new ApiError(409, "User with email or username already exists");

  // extract path of file (avatar , coverImage )
  /* 
  ?. -> optional chaining
  1. By using the Multer middleware in your route, you're able to access uploaded files via the req.files object.
  2. This is why you can get the file path from req.files?.avatar[0]?.path, which would not be possible in a standard Express request without file handling middleware.
  3. normally, an Express req object only contains text and JSON data, but with Multer, it gets extended to include file uploads, allowing you to handle them easily in your route handlers.
  */
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  // check avatar is available or not
  if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required");


  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)


  if(!avatar) throw new ApiError(400, "Avatar file is required");

  
  // make entry of user in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // make sure user is register or not if yes then remove the field like password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) throw new ApiError(500, "Something went wrong while registering user");

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

});

export { registerUser };
