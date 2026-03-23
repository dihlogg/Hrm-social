import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface CursorPaginationOptions {
  limit: number;
  cursor?: string;
  entityAlias: string;
  cursorColumn?: string;
  idColumn?: string;
  order?: 'ASC' | 'DESC';
  allowedColumns?: string[];
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

//Decode base64 cursor string to object.
function decodeCursor(cursor: string): Record<string, unknown> | null {
  try {
    const decodedString = Buffer.from(cursor, 'base64').toString('utf8');
    const decoded = JSON.parse(decodedString);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      Array.isArray(decoded)
    ) {
      return null;
    }

    return decoded as Record<string, unknown>;
  } catch {
    return null;
  }
}

//Encode object to base64 cursor string.
function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

//validate column name
function validateColumnName(column: string, allowedColumns?: string[]): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(column)) {
    throw new Error(`Invalid column name: "${column}"`);
  }

  if (allowedColumns && allowedColumns.length > 0) {
    if (!allowedColumns.includes(column)) {
      throw new Error(
        `Column "${column}" is not allowed. Allowed columns: ${allowedColumns.join(', ')}`,
      );
    }
  }
}

// serialize cursor value
function normalizeCursorValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

// cursor-based pagination function
export async function paginateWithCursor<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: CursorPaginationOptions,
): Promise<CursorPaginationResult<T>> {
  const limit = options.limit || 10;
  const order = options.order || 'DESC';
  const cursorColumn = options.cursorColumn || 'createDate';
  const idColumn = options.idColumn || 'id';
  const alias = options.entityAlias;

  validateColumnName(alias, options.allowedColumns);
  validateColumnName(cursorColumn, options.allowedColumns);
  validateColumnName(idColumn, options.allowedColumns);

  if (options.cursor) {
    const decoded = decodeCursor(options.cursor);

    if (decoded === null) {
      console.warn('[CursorPagination] Invalid cursor provided, ignoring');
    } else {
      const cursorVal = decoded[cursorColumn];
      const cursorId = decoded[idColumn];

      if (cursorVal === undefined || cursorId === undefined) {
        console.warn(
          `[CursorPagination] Cursor missing required fields: "${cursorColumn}", "${idColumn}"`,
        );
      } else {
        const operator = order === 'DESC' ? '<' : '>';
        queryBuilder.andWhere(
          `(${alias}.${cursorColumn} ${operator} :cursorVal` +
            ` OR (${alias}.${cursorColumn} = :cursorVal` +
            ` AND ${alias}.${idColumn} ${operator} :cursorId))`,
          { cursorVal, cursorId },
        );
      }
    }
  }

  queryBuilder
    .addOrderBy(`${alias}.${cursorColumn}`, order)
    .addOrderBy(`${alias}.${idColumn}`, order)
    .take(limit + 1);

  const entities = await queryBuilder.getMany();

  const hasNextPage = entities.length > limit;
  const data = hasNextPage ? entities.slice(0, -1) : entities;

  let nextCursor: string | null = null;

  if (hasNextPage) {
    const lastItem = data[data.length - 1];

    const rawCursorVal = lastItem[cursorColumn as keyof T];
    const rawCursorId = lastItem[idColumn as keyof T];

    const cursorData: Record<string, unknown> = {
      [cursorColumn]: normalizeCursorValue(rawCursorVal),
      [idColumn]: normalizeCursorValue(rawCursorId),
    };

    nextCursor = encodeCursor(cursorData);
  }

  return {
    data,
    nextCursor,
    hasNextPage,
  };
}
