import { Controller, Get } from '@nestjs/common';
import { MatchesService } from './matches.service';
@Controller()
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('/matches')
    async getRecentMatches(){

    }
    
    @Get('/matches/:id')
    async getMatch(){

    }
    
}
