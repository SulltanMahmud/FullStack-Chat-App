import express from "express"; //web framwork create api

import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "../src/routes/message.route.js";
import cors from "cors";
import { app, server } from "../src/lib/socket.js";

import path from "path"

dotenv.config();

const PORT = process.env.PORT; //acess env file data
const __dirname =path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.Node_ENV ==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

     app.get("*", (req, res) => {
       res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
     });
}

server.listen(PORT, () => {
  console.log("server is running in port  " + PORT);
  connectDB();
});
