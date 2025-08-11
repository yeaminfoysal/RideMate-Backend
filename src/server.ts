import { Server } from "http";
import dotenv from 'dotenv'

dotenv.config()
import app from "./app";
import mongoose from "mongoose";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(`${process.env.DB_URL}`)

        console.log('✅ Connected to MongoDB databse ✅');

        server = app.listen(3000, () => {
            console.log(`✅  Server is listening to port 3000 ✅ `);
        })
    } catch (error) {

    }
}

(async () => {
    await startServer()
})();

// "Unhandled rejection"
process.on("unhandledRejection", (err) => {
    console.log("Unhandled rejection detected.... Server shutting down....", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})

// "Uncought rejection"
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected.... Server shutting down....", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})

// "Uncought rejection"
process.on("SIGTERM", () => {
    console.log("SIGTERM signal recieved.... Server shutting down....");
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})