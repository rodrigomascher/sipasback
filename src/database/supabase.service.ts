import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_KEY environment variables are required',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Select from a table with optional pagination and sorting
   */
  async select(
    table: string,
    columns = '*',
    filters?: Record<string, any>,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
    limit?: number,
    offset?: number
  ) {
    let query: any = this.supabase.from(table).select(columns);

    if (filters && Object.keys(filters).length > 0) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase select error: ${error.message}`);
    }

    return data;
  }

  /**
   * Select with count for pagination
   */
  async selectWithCount(
    table: string,
    columns = '*',
    filters?: Record<string, any>,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
    limit?: number,
    offset?: number
  ) {
    let query: any = this.supabase.from(table).select(columns, { count: 'exact' });

    if (filters && Object.keys(filters).length > 0) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Supabase select error: ${error.message}`);
    }

    return { data, count };
  }

  /**
   * Insert into a table
   */
  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert([data])
      .select();

    if (error) {
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    return result;
  }

  /**
   * Update a table
   */
  async update(table: string, data: any, filters: Record<string, any>) {
    let query: any = this.supabase.from(table).update(data);

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }

    return result;
  }

  /**
   * Delete from a table
   */
  async delete(table: string, filters: Record<string, any>) {
    let query: any = this.supabase.from(table).delete();

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }

    return true;
  }

  /**
   * Count records in a table
   */
  async count(table: string, filters?: Record<string, any>) {
    let query = this.supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Supabase count error: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Raw SQL query (use with caution)
   */
  async rpc(functionName: string, params?: Record<string, any>) {
    const { data, error } = await this.supabase.rpc(functionName, params);

    if (error) {
      throw new Error(`Supabase RPC error: ${error.message}`);
    }

    return data;
  }
}
