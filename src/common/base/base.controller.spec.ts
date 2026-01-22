import { Test, TestingModule } from '@nestjs/testing';
import { BaseController } from './base.controller';
import { BaseService } from './base.service';
import { PaginationQueryDto } from '../dto/paginated-response.dto';
import { SupabaseService } from '../../database/supabase.service';

// Mock implementation of BaseController and BaseService for testing
class TestableService extends BaseService<any, any, any> {
  tableName = 'test_table';
  columns = ['id', 'name'];

  mapData(data: any): any {
    return data;
  }

  transformForDb(data: any): any {
    return data;
  }

  async findAll(query: PaginationQueryDto) {
    return {
      data: [{ id: 1, name: 'Test' }],
      total: 1,
      page: query.page || 1,
      pageSize: query.pageSize || 10,
    };
  }

  async findOne(id: any) {
    return { id, name: 'Test' };
  }

  async create(dto: any) {
    return { id: 1, ...dto };
  }

  async update(id: any, dto: any) {
    return { id, ...dto };
  }

  async remove(id: any) {
    return;
  }

  async count() {
    return 1;
  }
}

class TestableController extends BaseController<any, any, any> {
  constructor(service: TestableService) {
    super(service);
  }
}

describe('BaseController', () => {
  let controller: TestableController;
  let service: TestableService;

  beforeEach(() => {
    const mockSupabaseService: any = {
      select: jest.fn(),
      selectWithCount: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new TestableService(mockSupabaseService);
    controller = new TestableController(service);
  });

  describe('findAll', () => {
    it('should call service.findAll with correct pagination query', async () => {
      const spyFindAll = jest.spyOn(service, 'findAll');

      const result = await controller.findAll('1', '10', 'id', 'asc', 'search');

      expect(spyFindAll).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should handle undefined pagination parameters with defaults', async () => {
      const spyFindAll = jest.spyOn(service, 'findAll');

      const result = await controller.findAll(undefined, undefined, undefined, undefined, undefined);

      expect(spyFindAll).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct id', async () => {
      const spyFindOne = jest.spyOn(service, 'findOne');

      const result = await controller.findOne('1');

      expect(spyFindOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const spyCreate = jest.spyOn(service, 'create');
      const createDto = { name: 'New Test' };

      const result = await controller.create(createDto);

      expect(spyCreate).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({ id: 1, name: 'New Test' });
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const spyUpdate = jest.spyOn(service, 'update');
      const updateDto = { name: 'Updated' };

      const result = await controller.update('1', updateDto);

      expect(spyUpdate).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ id: 1, name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct id', async () => {
      const spyRemove = jest.spyOn(service, 'remove');

      const result = await controller.remove('1');

      expect(spyRemove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });
});
