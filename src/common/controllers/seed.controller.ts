import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from '../services/seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private seedService: SeedService) {}

  @Post('admin-user')
  @ApiOperation({ summary: 'Create admin user for testing' })
  @ApiResponse({
    status: 200,
    description: 'Admin user created successfully with credentials',
  })
  async seedAdminUser() {
    return this.seedService.seedAdminUser();
  }
}
