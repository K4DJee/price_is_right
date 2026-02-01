import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GoogleUserDto } from '../auth/dto/google-user.dto';

@Injectable()
export class DatabaseService extends PrismaClient
 implements OnModuleInit, OnModuleDestroy{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async findOrCreateUser(userData: GoogleUserDto){
    let dbUser = await this.user.findFirst({
      where:{
        OR:[
         { googleId: userData.providerId},
         { email: userData.email}
        ]
      },
      select:{
        id: true,
        googleId: true,
        email: true,
        nickname: true,
        createdAt: true
      }
    });

    if(dbUser){
      if(!dbUser.googleId){
        const updatedUser = await this.user.update({
          where:{
            id: dbUser.id
          },
          data:{
            googleId: userData.providerId,
            nickname: dbUser.nickname || userData.firstName,
          },
          select:{
            id: true,
            googleId: true,
            email: true,
            nickname: true,
            createdAt: true,
            // password: true,
          }
        })

        return updatedUser;
      }
      return dbUser;
    }
    dbUser = await this.user.create({
      data:{
        googleId: userData.providerId,
        email: userData.email,
        nickname: userData.firstName,
      },
      select:{
        id:true,
        googleId: true,
        email:true,
        nickname: true,
        createdAt: true
      }
    });
    return dbUser;
  }
 }