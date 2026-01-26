import { Test, TestingModule } from '@nestjs/testing';
import { EthnicitiesService } from './ethnicities.service';

describe('EthnicitiesService', () => {
  let service: EthnicitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EthnicitiesService],
    }).compile();

    service = module.get<EthnicitiesService>(EthnicitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
