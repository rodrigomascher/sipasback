/**
 * Pagination utility for related data
 * Helps manage pagination of related entities (e.g., user units, person family composition)
 * @module common/utils/related-entity-paginator
 */

/**
 * Options for paginating related entities
 * @interface RelatedEntityPaginationOptions
 * @property {number} [page=1] - Current page number (1-indexed)
 * @property {number} [pageSize=10] - Number of items per page
 * @property {string} [sortBy] - Field name to sort by
 * @property {'asc' | 'desc'} [sortDirection='asc'] - Sort direction
 */
export interface RelatedEntityPaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Paginated response structure for related entities
 * @interface PaginatedRelatedEntities
 * @template T - Type of items in the data array
 * @property {T[]} data - Array of items for current page
 * @property {number} total - Total number of items (all pages)
 * @property {number} page - Current page number
 * @property {number} pageSize - Items per page
 * @property {number} totalPages - Total number of pages
 */
export interface PaginatedRelatedEntities<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Helper class for paginating related entities
 * Provides static methods for sorting, filtering, and paginating arrays of data
 * 
 * @class RelatedEntityPaginator
 * @example
 * // Basic pagination
 * const paginated = RelatedEntityPaginator.paginate(units, {
 *   page: 1,
 *   pageSize: 10,
 *   sortBy: 'name',
 *   sortDirection: 'asc'
 * });
 * 
 * @example
 * // Filter and paginate
 * const filtered = RelatedEntityPaginator.filterAndPaginate(
 *   members,
 *   item => item.active === true,
 *   { page: 1, pageSize: 20 }
 * );
 */
export class RelatedEntityPaginator {
  /**
   * Paginate an array of items with optional sorting
   * 
   * Handles sorting by any field supporting strings, numbers, and dates.
   * Null/undefined values are placed at the end.
   * 
   * @template T - Type of items in the array
   * @param {T[]} items - Array of items to paginate
   * @param {RelatedEntityPaginationOptions} [options={}] - Pagination options
   * @returns {PaginatedRelatedEntities<T>} Paginated result with metadata
   * @throws {Error} If page or pageSize are invalid
   * 
   * @example
   * const result = RelatedEntityPaginator.paginate(
   *   [{ id: 1, name: 'Unit A' }, { id: 2, name: 'Unit B' }],
   *   { page: 1, pageSize: 10, sortBy: 'name', sortDirection: 'asc' }
   * );
   * // Returns: { data: [...], total: 2, page: 1, pageSize: 10, totalPages: 1 }
   */
  static paginate<T>(
    items: T[],
    options: RelatedEntityPaginationOptions = {}
  ): PaginatedRelatedEntities<T> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const sortBy = options.sortBy;
    const sortDirection = options.sortDirection || 'asc';

    // Sort if needed
    let sortedItems = [...items];
    if (sortBy) {
      sortedItems.sort((a: any, b: any) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Handle different types
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else if (typeof aValue === 'number') {
          const comparison = aValue - bValue;
          return sortDirection === 'asc' ? comparison : -comparison;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          const comparison = aValue.getTime() - bValue.getTime();
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        return 0;
      });
    }

    // Calculate pagination
    const total = sortedItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get page data
    const data = sortedItems.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Filter items then paginate the results
   * 
   * Applies filter function before pagination, useful for reducing dataset
   * before sorting and limiting to page size.
   * 
   * @template T - Type of items in the array
   * @param {T[]} items - Array of items to filter and paginate
   * @param {(item: T) => boolean} filterFn - Predicate function for filtering
   * @param {RelatedEntityPaginationOptions} [options={}] - Pagination options
   * @returns {PaginatedRelatedEntities<T>} Paginated filtered results
   * 
   * @example
   * const active = RelatedEntityPaginator.filterAndPaginate(
   *   members,
   *   item => item.active === true,
   *   { page: 1, pageSize: 10, sortBy: 'name' }
   * );
   */
  static filterAndPaginate<T>(
    items: T[],
    filterFn: (item: T) => boolean,
    options: RelatedEntityPaginationOptions = {}
  ): PaginatedRelatedEntities<T> {
    const filtered = items.filter(filterFn);
    return this.paginate(filtered, options);
  }

  /**
   * Map, optionally filter, then paginate items
   * 
   * Applies mapping first, then optional filtering, then pagination.
   * Useful for transforming and filtering related entities in one operation.
   * 
   * @template T - Type of source items
   * @template U - Type of mapped items
   * @param {T[]} items - Array of source items
   * @param {(item: T) => U} mapFn - Function to map each item
   * @param {(item: U) => boolean} [filterFn] - Optional filter predicate
   * @param {RelatedEntityPaginationOptions} [options={}] - Pagination options
   * @returns {PaginatedRelatedEntities<U>} Paginated mapped results
   * 
   * @example
   * const mapped = RelatedEntityPaginator.mapFilterAndPaginate(
   *   familyMembers,
   *   member => ({ ...member, fullName: member.firstName + ' ' + member.lastName }),
   *   item => item.status === 'active',
   *   { page: 1, pageSize: 10, sortBy: 'fullName' }
   * );
   */
  static mapFilterAndPaginate<T, U>(
    items: T[],
    mapFn: (item: T) => U,
    filterFn?: (item: U) => boolean,
    options: RelatedEntityPaginationOptions = {}
  ): PaginatedRelatedEntities<U> {
    const mapped = items.map(mapFn);
    const filtered = filterFn ? mapped.filter(filterFn) : mapped;
    return this.paginate(filtered, options);
  }
}

