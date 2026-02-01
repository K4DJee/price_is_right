import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class MailDto{
    @IsEmail()
    @IsNotEmpty()
    to: string

    @IsString()
    @IsNotEmpty()
    message: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    subject: string
}