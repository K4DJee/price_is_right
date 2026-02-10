import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './constants';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from '../database/database.service';
import { ClientProxy } from '@nestjs/microservices';
import { generateOtpASITEmail } from './dto/generate-otp-a-s-i-t-email.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { verifyOtpResetPassword } from './dto/verify-otp-reset-token.dto';
import { VerifyResetTokenChangePass2Dto } from './dto/verify-reset-token-change-pass2.dto';
import { VerifyResetTokenChangeEmail2Dto } from './dto/verify-reset-token-change-email2.dto.';
import { GoogleUserDto } from './dto/google-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly dbService: DatabaseService, 
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('MICROSERVICE_CLIENT') private readonly microserviceClient: ClientProxy,
  ){}

  async onModuleInit() {
    await this.microserviceClient.connect();
    console.log('✅ Connected to microservice');
  }
  
  async register(dto:RegisterDto){
    const existingUser = await this.dbService.user.findUnique({
        where: {email: dto.email}
    });

    if(existingUser){
        throw new ConflictException("User already exists");
    }

    const hashedPassword = await bcrypt.hash(dto.password, jwtConstants.saltRounds);

    const user = await this.dbService.user.create({
      data:{
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname
      },
      select:{
        id:true,
        email:true,
        nickname: true,
        createdAt: true
      }
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    });

    return {
      user, 
      ...tokens
    }
  }

  async login(dto: LoginDto){
    const user = await this.dbService.user.findUnique({
      where:{email: dto.email}
    });

    if(!user){
        throw new UnauthorizedException("Неверный email или password");
    }

    if(user.googleId && !user.password){
      throw new ForbiddenException("Пожалуйста авторизуйтесь через Google sign-in");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password!)
    
    if(!isPasswordValid){
      throw new UnauthorizedException("Неверный email или password");
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      nickname: user.nickname
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
      ...tokens
    }
  }

  async userData(){
    
  }

  async logout(){

  }

  private async generateTokens(payload: IJwtPayload){//Генерация access и refresh токенов

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync<IJwtPayload>(payload,{
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRY')
      }),
      await this.jwtService.signAsync<IJwtPayload>(payload,{
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn:this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRY')
      }),
    ]);

    const expiresIn = this.getTokenExpiration(this.configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRY'));


    return { accessToken, refreshToken, expiresIn };
  }

  async refreshToken(refreshToken: string){
    try{  
      //Верификация payload
      const veryfyPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.secret
      });

      const user = await this.dbService.user.findUnique({
        where:{id: veryfyPayload.sub},
        select:{
          id: true,
          nickname: true,
          email:true,
        }
      });

      if(!user){
        throw new UnauthorizedException();
      }

      return await this.generateTokens({
        sub:user.id,
        email: user.email,
        nickname: user.nickname,
      })
    }
    catch(error){
      throw new UnauthorizedException("Невалидный refresh-токен");
    }
  }

  async validateUser(payload: IJwtPayload){
    const user = await this.dbService.user.findUnique({
      where: {id: payload.sub},
    });

    return user;
  }

  private getTokenExpiration(expiresIn: number){

  }

  async generateOtp(dto: generateOtpASITEmail){
    try {
      const response = await this.microserviceClient
        .send({cmd:'generate-otp'}, dto)
        .toPromise();
      
      console.log('✅ Microservice response:', response);
      return response;
    } catch (error) {
      console.error('❌ Microservice error:', error);
      return error;
    }
  }

  async findUserByEmail(dto:FindUserByEmailDto){
    const user = await this.dbService.user.findUnique({
      where: {email: dto.email},
      select:{
        id: true,
        email: true,
        nickname: true,
      }
    });

    if(!user){
      throw new NotFoundException("Пользователь не найден");
    }

    return user;
  }

  async verifyOtpAndGenResetToken(dto:verifyOtpResetPassword){
    try {
      const response = await this.microserviceClient
        .send({cmd:'verify-otp'}, dto)
        .toPromise();
      
      console.log('✅ Microservice response:', response);
      return response;
    } catch (error) {
      console.error('❌ Microservice error:', error);
      return error;
    }
  }

  async verifyResetToken(identifier: string, resetToken: string): Promise<boolean>{
    try {
      const response = await this.microserviceClient
        .send({cmd:'verify-reset-token'}, {identifier, resetToken})
        .toPromise();
      
      console.log('✅ Microservice response:', response);
      return response;
    } catch (error) {
      console.error('❌ Microservice error:', error);
      return false;
    }
  }

  async verifyResetTokenAndChangeUserPassword(dto: VerifyResetTokenChangePass2Dto){
    const isValid = await this.verifyResetToken(dto.identifier, dto.resetToken);
    if(!isValid){
      throw new BadRequestException("Вы ввели неправильный resetToken");
    }

    const updatedUser = await this.changeUserPassword(dto.identifier,dto.newPassword);
    if(!updatedUser){
      throw new InternalServerErrorException("Ошибка смены пароля");
    }


    return {
      message: "Пароль был успешно сменён!"
    }
    
  }

  private async changeUserPassword(identifier:string, newPassword: string){
    const hashedPassword = await bcrypt.hash(newPassword, jwtConstants.saltRounds);
    const updatedUser = await this.dbService.user.update({
      where:{ id: identifier},
      data:{
        password: hashedPassword
      }
    });

    return updatedUser;
  }

  private async changeUserEmail(identifier:string, newEmail: string){
    const updatedUser = await this.dbService.user.update({
      where:{ id: identifier},
      data:{
        email: newEmail
      }
    });

    return updatedUser;
  }

  async verifyResetTokenAndChangeUserEmail(dto: VerifyResetTokenChangeEmail2Dto){
    const isValid = await this.verifyResetToken(dto.identifier, dto.resetToken);
    if(!isValid){
      throw new BadRequestException("Вы ввели неправильный resetToken");
    }

    const updatedUser = await this.changeUserEmail(dto.identifier,dto.newEmail);
    if(!updatedUser){
      throw new InternalServerErrorException("Ошибка смены почты");
    }


    return {
      message: "Почта была успешно сменена!"
    }
    
  }

  async validateOAuthLogin(user: GoogleUserDto){
    const dbUser = await this.dbService.findOrCreateUser(user);

    const tokens = await this.generateTokens({
      sub: dbUser.id,
      email: dbUser.email,
      nickname: dbUser.nickname
    });

    return {
      dbUser,
      ...tokens
    }
  }
}
