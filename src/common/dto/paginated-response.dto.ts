/**
 * Generic Paginated Response DTO
 * Used for all paginated API responses
 */
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  constructor(data: T[], total: number, page: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}

/**
 * Pagination Query Parameters DTO
 * Used to parse pagination query params from requests
 */
export class PaginationQueryDto {
  page: number = 1;
  pageSize: number = 10;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' = 'asc';
  search?: string;

  constructor(data?: Partial<PaginationQueryDto>) {
    if (data) {
      this.page = Math.max(1, data.page || 1);
      this.pageSize = Math.min(100, Math.max(1, data.pageSize || 10));
      this.sortBy = data.sortBy;
      this.sortDirection = (data.sortDirection === 'desc' ? 'desc' : 'asc');
      this.search = data.search;
    }
  }

  getOffset(): number {
    return (this.page - 1) * this.pageSize;
  }
}
