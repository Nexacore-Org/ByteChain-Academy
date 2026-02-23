import { Injectable } from '@nestjs/common';
import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';

export interface PaginateOptions {
  page: number;
  limit: number;
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
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: PaginateOptions,
    findOptions?: Omit<FindManyOptions<T>, 'skip' | 'take'>,
  ): Promise<PaginatedResult<T>> {
    const { page, limit } = options;
    const [data, total] = await repository.findAndCount({
      ...findOptions,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
