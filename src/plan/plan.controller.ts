import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plan')
export class PlanController {
    constructor(private readonly planService: PlanService){}

    @Post()
    create(@Body() dto: CreatePlanDto){
        return this.planService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ){
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.planService.findAll(pageNum, limitNum);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.planService.findOne(+id);
    }
    
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePlanDto){
        return this.planService.update(+id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.planService.delete(+id);
    }

    @Delete(':id/cascade')
    deleteWithCascade(@Param('id') id: string) {
        return this.planService.deleteWithCascade(+id);
    }
}
