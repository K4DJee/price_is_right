import { IsNotEmpty, IsString } from "class-validator";

export class VerifyResetToken{
    @IsString()
    @IsNotEmpty()
    identifier: string

    @IsString()
    @IsNotEmpty()
    resetToken: string

    @IsString()
    @IsNotEmpty()
    resetTokenName: string
    
}