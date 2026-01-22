/**
 * PaginationQueryBuilder - Utility for constructing pagination queries from raw parameters
 * Converts string/number query parameters to typed PaginationQueryDto
 *
 * Usage:
 * const pagination = PaginationQueryBuilder.fromQuery({
 *   page: req.query.page,
 *   pageSize: req.query.pageSize,
 *   sortBy: req.query.sortBy,
 *   sortDirection: req.query.sortDirection,
 * });
 * return this.service.findAll(pagination);
 */
export class PaginationQueryBuilder {
  /**
   * Build pagination query from request parameters
   * Automatically handles type conversion and defaults
   */
  static fromQuery(query: {
    page?: string | number;
    pageSize?: string | number;
    sortBy?: string;
    sortDirection?: string;
    search?: string;
  }) {
    return {
      page: this.parseNumber(query.page, 1),
      pageSize: this.parseNumber(query.pageSize, 10),
      sortBy: query.sortBy || 'id',
      sortDirection: (query.sortDirection as 'asc' | 'desc') || 'asc',
      search: query.search,
    };
  }

  /**
   * Parse value to number with default fallback
   */
  private static parseNumber(
    value?: string | number,
    defaultValue: number = 1,
  ): number {
    if (!value) return defaultValue;
    if (typeof value === 'number') return value;

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
