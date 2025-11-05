import { Test, TestingModule } from '@nestjs/testing';
import { ClientePlanService } from './cliente-plan.service';

describe('ClientePlanService', () => {
  let service: ClientePlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientePlanService],
    }).compile();

    service = module.get<ClientePlanService>(ClientePlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
