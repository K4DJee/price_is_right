import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MatchesService } from './matches.service';
import { CreateMatchDto, FinalizeMatchDto } from './dto/match.dto';
@Controller()
export class MatchesMicroserviceController {
  constructor(private readonly matchesService: MatchesService) {}

  @MessagePattern('create_match')
  async createMatch(@Payload() createMatchDto: CreateMatchDto) {
    await this.matchesService.createMatch(createMatchDto);
    return { success: true, matchId: createMatchDto.id };
    
  }

  @MessagePattern('finalize_match')
  async finalizeMatch(@Payload() finalizeMatchDto: FinalizeMatchDto) {
    await this.matchesService.finalizeMatch(finalizeMatchDto);
    return { success: true, matchId: finalizeMatchDto.id };
  }

}
