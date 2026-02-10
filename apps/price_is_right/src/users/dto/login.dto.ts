import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto{
    @ApiProperty({description: "Электронная почта пользователя", example:"example@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({description: "Пароль", example:"213123SDDA-Sda231D_dsa"})
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}