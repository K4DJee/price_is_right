import { UserFromDB } from '../interfaces/user.interface';

declare module 'socket.io' {
  interface Handshake {
    user?: UserFromDB;
  }
}