import { Test, TestingModule } from '@nestjs/testing';
import { ClientePlanController } from './cliente-plan.controller';

describe('ClientePlanController', () => {
  let controller: ClientePlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientePlanController],
    }).compile();

    controller = module.get<ClientePlanController>(ClientePlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
