import { Server } from "http";
import app from "./app";

let server: Server;

const startServer = async () => {
    try {
        server = app.listen(3000, () => {
            console.log(`Server is listening to port 3000`);
        })
    } catch (error) {

    }
}

(async () => {
    await startServer()
})()