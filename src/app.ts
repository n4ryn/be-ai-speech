import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
dotenv.config();

// Routes
import authRouter from "./routes/auth.routes";

const app = express();
const port = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/", authRouter);

connectDB()
  .then(() => {
    console.log("Database connected");

    app.listen(port, () => {
      return console.log(`Server is listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to database", error);
  });
