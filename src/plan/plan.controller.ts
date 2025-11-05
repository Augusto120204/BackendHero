import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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
    findAll(){
        return this.planService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.planService.findOne(+id);
    }
    
    @Patch(' :id')
    update(@Param('id') id: string, @Body() dto: UpdatePlanDto){
        return this.planService.update(+id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.planService.delete(+id);
    }
}
