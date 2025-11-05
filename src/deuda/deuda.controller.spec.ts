import { Test, TestingModule } from '@nestjs/testing';
import { DeudaController } from './deuda.controller';

describe('DeudaController', () => {
  let controller: DeudaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeudaController],
    }).compile();

    controller = module.get<DeudaController>(DeudaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
