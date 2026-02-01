import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class generateOtpASITEmail{
    @ApiProperty({description: "ID пользователя", example:"1"})
    @IsString()
    @IsNotEmpty()
    identifier: string

    @ApiProperty({description: "Почта пользователя, на которую отправляется одноразовый код", example:"example@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    to: string
    
    @ApiProperty({description: "Сообщение, которое должно оповестить пользователя о назначении одноразового кода", example:"Сброс пароля"})
    @IsString()
    @IsNotEmpty()
    message: string

    @ApiProperty({description: "Имя пользователя", example:"Ivan"})
    @IsString()
    @IsNotEmpty()
    username: string

    @ApiProperty({description: "Заголовок письма", example:"Reset password"})
    @IsString()
    @IsNotEmpty()
    subject: string

    @ApiProperty({description: "У этой переменной может быть только 2 значения: passwordOtp и emailOtp", example:"emailOtp"})
    @IsString()
    @IsNotEmpty()
    otpName: string
}