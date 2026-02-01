import { IUserRequest } from "../src/auth/interfaces/user.interface";

declare global{
    namespace Express{
        interface Request{
            user?: IUserRequest
        }
    }
}