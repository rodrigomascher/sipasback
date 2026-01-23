# ADR-001: Related Entity Pagination Pattern

## Status
✅ **Accepted**

## Date
January 23, 2024

## Context

The SIPAS backend needs to handle pagination for related entities (e.g., units assigned to a user, family members for a person). These related items are typically:

1. **Smaller datasets** - Usually tens to hundreds, not millions
2. **Already in memory** - Fetched via association queries
3. **Need sorting/filtering** - By multiple fields and directions
4. **Accessed frequently** - In list views and detail screens

### Problem Statement

We faced a choice between:
1. **Server-side pagination** - Complex database queries with GROUP BY and pagination at query level
2. **Client-side pagination** - Fetch all related items and paginate in memory
3. **Separate table pagination** - Create junction tables with pagination support

### Constraints

- Database schema already uses foreign keys for relationships
- Need to keep API response format consistent
- Support concurrent requests safely
- Minimize database queries

## Decision

**Implement client-side pagination using RelatedEntityPaginator utility class**

### Rationale

1. **Simplicity** - No complex JOIN or GROUP BY queries
2. **Flexibility** - Pagination logic is reusable across all services
3. **Consistency** - All related entities use same pagination response format
4. **Performance** - Related entity sets are small; in-memory pagination is negligible overhead
5. **Type Safety** - Generic class supports any entity type

### Implementation Details

**Location:** `src/common/utils/related-entity-paginator.ts`

**Key Features:**
- Static methods for pagination, filtering, and mapping
- Supports sorting by any field (string, number, Date)
- Handles null/undefined values gracefully
- Maintains total count for pagination metadata

**Usage Pattern:**
```typescript
// In PersonsService
async getPersonFamilyMembersPaginated(
  personId: number,
  paginationOptions?: RelatedEntityPaginationOptions,
): Promise<PaginatedRelatedEntities<any>> {
  // 1. Fetch all related items
  const members = await this.supabaseService.select(...);
  
  // 2. Apply pagination
  return RelatedEntityPaginator.paginate(members, paginationOptions);
}
```

**Response Format:**
```typescript
interface PaginatedRelatedEntities<T> {
  data: T[];           // Items for current page
  total: number;       // Total items across all pages
  page: number;        // Current page (1-indexed)
  pageSize: number;    // Items per page
  totalPages: number;  // Total pages (Math.ceil(total / pageSize))
}
```

## Advantages

✅ **Reusable** - Same utility works for all related entities (units, family, etc.)
✅ **Consistent** - Unified pagination response format across API
✅ **Type-safe** - Full TypeScript generic support
✅ **Flexible** - Built-in support for sorting, filtering, mapping
✅ **Maintainable** - Logic isolated in single utility class
✅ **Testable** - Pure function approach, no side effects
✅ **Fast** - In-memory operations on typically small datasets

## Disadvantages

❌ **Memory** - Fetches all related items (scales poorly for millions)
❌ **Real-time** - Pagination done after fetch, not at DB level
❌ **Sorting** - Complex fields require pre-processing

## Alternatives Considered

### Alternative 1: Server-side Pagination with Subqueries
```sql
SELECT p.*, fc.id FROM persons p
LEFT JOIN (
  SELECT * FROM family_composition 
  WHERE person_id = ? 
  ORDER BY created_at DESC 
  LIMIT 10 OFFSET 0
) fc ON p.id = fc.person_id
```

**Rejected because:**
- Complex SQL queries hard to maintain
- Limited pagination flexibility per service
- Harder to test

### Alternative 2: Separate Pagination Junction Table
Create `person_family_pagination` table to track pagination state.

**Rejected because:**
- Adds unnecessary schema complexity
- Breaks data normalization
- Requires migration and maintenance

## Migration Path

1. ✅ Created `RelatedEntityPaginator` utility (generic, reusable)
2. ✅ Enhanced `UserUnitsService` with `getUnitsForUserPaginated()`
3. ✅ Enhanced `PersonsService` with family pagination methods
4. ✅ Enhanced `FamilyCompositionService` with member pagination
5. ⏳ (Future) Apply to other services (employees, departments, etc.)

## Future Improvements

1. **Server-side pagination** - If related datasets grow beyond 10K items
2. **Caching** - Implement Redis caching for frequently accessed pages
3. **Lazy loading** - Load related items only when requested
4. **Filtering engine** - Advanced filter syntax for complex queries

## Examples

### Basic Pagination
```typescript
// Get users's units, page 1, 10 per page
const result = await userUnitsService.getUnitsForUserPaginated(5, {
  page: 1,
  pageSize: 10
});
// Returns: { data: [...10 units], total: 45, page: 1, pageSize: 10, totalPages: 5 }
```

### With Sorting
```typescript
// Get family members sorted by name ascending
const result = await familyCompositionService.getFamilyMembersPaginated(1, {
  page: 1,
  pageSize: 20,
  sortBy: 'firstName',
  sortDirection: 'asc'
});
```

### Filter and Paginate
```typescript
// Get active members only
const filtered = RelatedEntityPaginator.filterAndPaginate(
  allMembers,
  member => member.status === 'active',
  { page: 1, pageSize: 10, sortBy: 'name' }
);
```

## Testing

### Unit Tests
```typescript
describe('RelatedEntityPaginator', () => {
  it('should paginate items correctly', () => {
    const items = [...100 items];
    const result = RelatedEntityPaginator.paginate(items, {
      page: 2,
      pageSize: 10
    });
    
    expect(result.data.length).toBe(10);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(10);
    expect(result.total).toBe(100);
  });
});
```

### Integration Tests
```typescript
describe('PersonsService', () => {
  it('should return paginated family members', async () => {
    const result = await service.getPersonFamilyMembersPaginated(1, {
      page: 1,
      pageSize: 5
    });
    
    expect(result.data.length).toBeLessThanOrEqual(5);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.totalPages).toBeGreaterThanOrEqual(0);
  });
});
```

## API Endpoints

### Users Module
```
GET /api/user-units/:userId?page=1&pageSize=10&sortBy=name
```

### Persons Module
```
GET /api/persons/:id/family-members?page=1&pageSize=10
GET /api/persons/:id/with-family?page=1&pageSize=10
```

### Family Composition Module
```
GET /family-composition/person/:personId/paginated?page=1&pageSize=10
GET /family-composition/family/:familyId/paginated?page=1&pageSize=10
```

## Documentation

- See [ARCHITECTURE.md](../ARCHITECTURE.md) for system overview
- See [README.md](../README.md) for API usage examples
- JSDoc comments in RelatedEntityPaginator for detailed method documentation

## Questions & Answers

**Q: Won't this fail with very large related datasets?**
A: Yes. If a person has 100K+ family members, we'd need to revisit this. For the typical SIPAS use case (families with <50 members), this is perfect.

**Q: Why not use database-level LIMIT/OFFSET?**
A: Because we fetch all related items anyway (each unit for a user, each family member). Pagination is a presentation layer concern.

**Q: How does this compare to cursor-based pagination?**
A: Cursor pagination is better for APIs with streaming data. For our use case (bounded datasets), offset-based is simpler and sufficient.

## References

- [Pagination Patterns in REST APIs](https://www.smashingmagazine.com/2013/05/restful-api-design-best-practices-for-pagination/)
- [Supabase Pagination Guide](https://supabase.com/docs/guides/api#pagination)
- [NestJS Pagination Best Practices](https://docs.nestjs.com/techniques/database#pagination)

---

**Decision Maker:** Development Team
**Approval Date:** January 23, 2024
