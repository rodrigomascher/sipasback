import {
  applyDecorators,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * @ApiPaginationQuery - Decorator that applies common pagination query parameters
 * Eliminates repetitive @ApiQuery decorators from controllers
 *
 * Usage:
 * @Get()
 * @ApiPaginationQuery()
 * async findAll(@Query() query: any) { ... }
 */
export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'sortBy', required: false, type: String, example: 'id' }),
    ApiQuery({
      name: 'sortDirection',
      required: false,
      type: String,
      enum: ['asc', 'desc'],
      example: 'asc',
    }),
    ApiQuery({ name: 'search', required: false, type: String, example: '' }),
  );
}

/**
 * @ApiCrudOperation - Decorator for standard CRUD operations with auth
 * Combines common decorators for create/read/update/delete endpoints
 *
 * Usage options:
 * @Get()
 * @ApiCrudOperation('List all items')
 * async findAll() { ... }
 *
 * @Post()
 * @ApiCrudOperation('Create item', 201)
 * async create() { ... }
 *
 * @Put(':id')
 * @ApiCrudOperation('Update item')
 * async update() { ... }
 *
 * @Delete(':id')
 * @ApiCrudOperation('Delete item')
 * async remove() { ... }
 */
export function ApiCrudOperation(
  summary: string,
  statusCode: number = 200,
  requireAuth: boolean = true,
) {
  const decorators = [
    ApiOperation({ summary }),
    ApiResponse({
      status: statusCode,
      description:
        statusCode === 201
          ? 'Item created successfully'
          : statusCode === 204
            ? 'Item deleted successfully'
            : 'Operation successful',
    }),
    ApiResponse({
      status: 404,
      description: 'Item not found',
    }),
  ];

  if (requireAuth) {
    decorators.push(UseGuards(JwtAuthGuard));
    decorators.push(ApiBearerAuth('access-token'));
  }

  if (statusCode === 201) {
    decorators.push(HttpCode(HttpStatus.CREATED));
  } else if (statusCode === 204) {
    decorators.push(HttpCode(HttpStatus.NO_CONTENT));
  }

  decorators.push(
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );

  return applyDecorators(...decorators);
}

/**
 * @ApiListOperation - Decorator for list/findAll endpoints with pagination
 * Combines pagination query decorators with operation metadata
 *
 * Usage:
 * @Get()
 * @ApiListOperation('List items')
 * async findAll(@Query() query: any) { ... }
 */
export function ApiListOperation(
  summary: string = 'List items with pagination',
) {
  return applyDecorators(
    ApiCrudOperation(summary, 200, true),
    ApiPaginationQuery(),
  );
}

/**
 * @ApiGetOperation - Decorator for single item retrieval
 * Standard decorator for GET :id endpoints
 *
 * Usage:
 * @Get(':id')
 * @ApiGetOperation('Get item by ID')
 * async findOne(@Param('id') id: string) { ... }
 */
export function ApiGetOperation(summary: string = 'Get item by ID') {
  return ApiCrudOperation(summary, 200, true);
}

/**
 * @ApiCreateOperation - Decorator for POST/create endpoints
 * Standard decorator for create operations
 *
 * Usage:
 * @Post()
 * @ApiCreateOperation('Create item')
 * async create(@Body() dto: CreateDto) { ... }
 */
export function ApiCreateOperation(summary: string = 'Create new item') {
  return ApiCrudOperation(summary, 201, true);
}

/**
 * @ApiUpdateOperation - Decorator for PUT/PATCH/update endpoints
 * Standard decorator for update operations
 *
 * Usage:
 * @Put(':id')
 * @ApiUpdateOperation('Update item')
 * async update(@Param('id') id: string, @Body() dto: UpdateDto) { ... }
 */
export function ApiUpdateOperation(summary: string = 'Update item') {
  return ApiCrudOperation(summary, 200, true);
}

/**
 * @ApiDeleteOperation - Decorator for DELETE endpoints
 * Standard decorator for delete operations
 *
 * Usage:
 * @Delete(':id')
 * @ApiDeleteOperation('Delete item')
 * async remove(@Param('id') id: string) { ... }
 */
export function ApiDeleteOperation(summary: string = 'Delete item') {
  return ApiCrudOperation(summary, 200, true);
}
