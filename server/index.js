import express, { json } from "express";
import dotenv from "dotenv";
import routes from "./Routes/index.js";
import { engine } from "express-handlebars";
import connectDB from "./db.js";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
  morgan(':method :url :status :res[content-length] - :response-time ms')
);

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100kb" }));
app.use("/uploads", express.static("uploads"));

// basic rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);
app.engine("handlebars", engine());
app.set("view engine", "hbs");
app.set("views", "./views");

// Routes
routes(app);

connectDB()
app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});
