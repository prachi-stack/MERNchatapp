// The main file we make server and connenct with database and define api link
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoute from "./routes/auth_route.js";
import messageRoutes from './routes/message_route.js'
import cookieParser from 'cookie-parser';
import cors from "cors";
import { app,server } from "./lib/socket.js";

dotenv.config()
const PORT=process.env.PORT;

app.use(express.json({ limit: '1mb' })); // increase to 1 MB or more
app.use(cookieParser());
app.use(cors(
    {origin:"http://localhost:5173",
    credentials:true
}
))

app.use(express.urlencoded({ extended: true, limit: '1mb' }));


app.use('/api/auth',authRoute);
app.use('/api/message',messageRoutes);

server.listen(PORT,()=>{
    console.log("Server is running on port: "+PORT);
    connectDB()
})