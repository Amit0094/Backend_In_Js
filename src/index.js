// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log(`Express server error: `, error); // TODO
    })
    app.listen(port, () => {
        console.log(`Server is running at port : ${port}`)
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err)
})














/* FIRST APPROACH

import express from "express";
const app = express()

( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    //    1. It does not check the connection between your Express app and the MongoDB database.
    //    2. It only listens for and handles errors that occur within the Express server itself (like failing to bind to a port, request handling issues, or middleware problems).

       app.on("error", (error) => {
        console.log("ERROR: ", error)
        throw error
       })

       app.listen(process.env.PORT, ()=> {
        console.log(`App is listening on port ${process.env.PORT}`)
       })

    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()

*/