import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class FindUserByEmailDto {
    @ApiProperty({description: "Электронная почта пользователя", example:"example@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string
}