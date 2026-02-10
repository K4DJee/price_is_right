import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';


@Controller()
export class UsersMicroserviceController {
  constructor(
    private readonly usersService: UsersService
) {}

  @MessagePattern('get_user')
  async createMatch(@Payload() id:string) {
    return await this.usersService.getUser(id);
  }

}
