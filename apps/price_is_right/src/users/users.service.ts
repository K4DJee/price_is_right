import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dbService: DatabaseService
  ){}

  async getUser(id: string){
    const user = await this.dbService.user.findUnique({
      where:{id: id},
      select:{
        id:true,
        email:true,
        nickname: true,
      }
    });

    return user;
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

  async changeUserPassword(identifier:string, newPassword: string){
    const hashedPassword = await bcrypt.hash(newPassword, jwtConstants.saltRounds);
    const updatedUser = await this.dbService.user.update({
      where:{ id: identifier},
      data:{
        password: hashedPassword
      }
    });

    return updatedUser;
  }

  async changeUserEmail(identifier:string, newEmail: string){
    const updatedUser = await this.dbService.user.update({
      where:{ id: identifier},
      data:{
        email: newEmail
      }
    });

    return updatedUser;
  }

  async createUser(dto:RegisterDto, hashedPassword: string){
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
  }


}
