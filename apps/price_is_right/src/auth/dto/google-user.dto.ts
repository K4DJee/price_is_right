import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class GoogleUserDto {
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsString()
    picture: string

    @IsString()
    @IsNotEmpty()
    accessToken: string

    @IsString()
    @IsNotEmpty()
    refreshToken: string

    @IsString()
    @IsNotEmpty()
    provider: string
    
    @IsString()
    @IsNotEmpty()
    providerId: string
}