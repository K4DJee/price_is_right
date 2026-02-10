import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateMatchDto{
    @IsString()
    @IsNotEmpty()
    id: string    
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty() 
    users: string[] 
    @IsString()
    winner: string
    @IsString()
    loser: string
    @IsNumber()
    p1Answer: number
    @IsNumber()
    p2Answer: number
    @IsNumber()
    correctAnswer: number
}

export class FinalizeMatchDto{
    @IsString()
    @IsNotEmpty()
    id: string    
    @IsString()
    @IsNotEmpty()
    winner: string
    @IsString()
    @IsNotEmpty()
    loser: string
    @IsNumber()
    @IsNotEmpty()
    p1Answer: number
    @IsNumber()
    @IsNotEmpty()
    p2Answer: number
    @IsNumber()
    @IsNotEmpty()
    correctAnswer: number
}