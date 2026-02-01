import { IsNotEmpty, IsString } from "class-validator"

export class joiningUser {
    @IsString()
    @IsNotEmpty()
    id: string
    nickname: string
    score: number
}