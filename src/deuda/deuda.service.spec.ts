import { Test, TestingModule } from '@nestjs/testing';
import { DeudaService } from './deuda.service';

describe('DeudaService', () => {
  let service: DeudaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeudaService],
    }).compile();

    service = module.get<DeudaService>(DeudaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
