import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"

export class RegisterDto {
    @ApiProperty({description: "Никнейм пользователя", example: "Иван232", type: String})
    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    nickname: string

    @ApiProperty({description: "Электронная почта пользователя", example: "example@gmail.com", type: String})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({description: "Пароль", example: "21312321SADA-1fasda", type: String})
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string
}