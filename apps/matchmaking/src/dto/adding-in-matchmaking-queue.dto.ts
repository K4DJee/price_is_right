import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class addingInMatchmakingQueue{
    @IsString()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsNotEmpty()
    nickname: string
    
    @IsNumber()
    @IsNotEmpty()
    score: number
}