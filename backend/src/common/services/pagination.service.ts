import { Injectable } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  ObjectLiteral,
} from 'typeorm';

export interface PaginateOptions<T> {
  page: number;
  limit: number;
  where?: FindOptionsWhere<T>;
  order?: FindOptionsOrder<T>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PaginationService {
  /**
   * Paginate a TypeORM repository query.
   * @param repo Repository instance
   * @param options page (1-based), limit, optional where and order
   * @returns Paginated result with data, total, page, limit, totalPages
   */
  async paginate<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: PaginateOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const { page, limit, where, order } = options;
    const skip = (Math.max(1, page) - 1) * limit;
    const take = Math.max(1, Math.min(limit, 100));

    const [data, total] = await Promise.all([
      repo.find({
        where,
        order,
        skip,
        take,
      }),
      repo.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      page: Math.max(1, page),
      limit: take,
      totalPages,
    };
  }
}
