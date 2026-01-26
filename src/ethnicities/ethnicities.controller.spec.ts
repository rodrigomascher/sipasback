import { Test, TestingModule } from '@nestjs/testing';
import { EthnicitiesController } from './ethnicities.controller';
import { EthnicitiesService } from './ethnicities.service';

describe('EthnicitiesController', () => {
  let controller: EthnicitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EthnicitiesController],
      providers: [EthnicitiesService],
    }).compile();

    controller = module.get<EthnicitiesController>(EthnicitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
