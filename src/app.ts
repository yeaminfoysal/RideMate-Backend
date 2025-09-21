import cookieParser from "cookie-parser";
import express, { Request, Response } from "express"
import cors from "cors"
import { UserRoutes } from "./app/modules/user/user.route";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import passport from "passport";
import "./app/config/passport";
import expressSession from "express-session"
import { authRoutes } from "./app/modules/auth/auth.route";
import { DriverRoute } from "./app/modules/driver/driver.route";
import { RideRoute } from "./app/modules/ride/ride.route";
import { PaymentRoute } from "./app/modules/payment/payment.route";

const app = express();
app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1)
app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
));

app.use("/api/v1/user", UserRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/driver", DriverRoute)
app.use("/api/v1/ride", RideRoute)
app.use("/api/v1/payment", PaymentRoute)

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to RideMate Server"
    })
})
app.use(globalErrorHandler)

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
});

export default app;