import { UserFromDB } from "../interfaces/user.interface";
import { Socket } from 'socket.io';
import { CustomSocketData } from "./socket.types";

declare module 'socket.io' {
    interface Socket {
        user: CustomSocketData
    };
}