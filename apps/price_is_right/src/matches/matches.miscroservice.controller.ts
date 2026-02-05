import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/match.dto';
@Controller()
export class MatchesMicroserviceController {
  constructor(private readonly matchesService: MatchesService) {}

  @MessagePattern('create_match')
  async createMatch(@Payload() createMatchDto: CreateMatchDto) {
    return this.matchesService.createMatch(createMatchDto);
  }

  @MessagePattern('finalize_match')
  async finalizeMatch(@Payload() createMatchDto) {
    return this.matchesService.finalizeMatch();
  }

}
