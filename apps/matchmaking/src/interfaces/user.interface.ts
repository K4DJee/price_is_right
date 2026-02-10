export interface UserFromDB{
    id:string;
    email:string;
    nickname: string;
}

export interface IJwtPayload {
    sub: string;
    email: string;
    nickname: string;
  }