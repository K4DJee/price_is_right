import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateMatchDto{
    @IsString()
    @IsNotEmpty()
    id: string    
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty() 
    usersIds: string[] 
    @IsString()
    winner: string
    @IsString()
    loser: string
    @IsString()
    p1Answer: string
    @IsString()
    p2Answer: string
    @IsNumber()
    correctAnswer: number
}