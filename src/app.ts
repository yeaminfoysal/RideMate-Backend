import cookieParser from "cookie-parser";
import express, { Request, Response } from "express"
import cors from "cors"

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to RideMate Server"
    })
})

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
});

export default app;