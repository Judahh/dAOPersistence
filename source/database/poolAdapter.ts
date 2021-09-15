import { PersistenceInfo } from 'flexiblepersistence';

/* eslint-disable no-unused-vars */
export interface PoolAdapter {
  simpleCreate?: boolean;
  simpleUpdate?: boolean;
  simpleDelete?: boolean;

  isCreateLimitBefore?: boolean;
  isReadLimitBefore?: boolean;
  isUpdateLimitBefore?: boolean;
  isDeleteLimitBefore?: boolean;

  createLimit?: string;
  readLimit?: string;
  updateLimit?: string;
  deleteLimit?: string;

  getNumberOfPages(
    script: string,
    options?: {
      page?: number;
      pageSize?: number;
      numberOfPages?: number;
    }
  ): Promise<void>;

  generatePaginationPrefix(options?: {
    page?: number;
    pageSize?: number;
    numberOfPages?: number;
  }): Promise<unknown>;

  generatePaginationSuffix(options?: {
    page?: number;
    pageSize?: number;
    numberOfPages?: number;
  }): Promise<unknown>;
  connect(
    callback?: (error?: Error, client?: unknown, release?: unknown) => void
  ): Promise<unknown>;
  query(
    script: string,
    values?: Array<unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (error?: any, result?: any) => unknown
  ): Promise<unknown>;
  end(callback?: () => unknown): Promise<unknown>;
  getPersistenceInfo(): PersistenceInfo;
}
