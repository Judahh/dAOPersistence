import { PersistenceInfo } from 'flexiblepersistence';

/* eslint-disable no-unused-vars */
export interface IPool {
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

  getPages(
    script: string,
    options?: {
      page?: number;
      pageSize?: number;
      numberOfPages?: number;
    }
  ): Promise<number>;

  generatePaginationPrefix(
    options?: {
      page?: number;
      pageSize?: number;
      numberOfPages?: number;
    },
    idName?: string
  ): Promise<string>;

  generatePaginationSuffix(options?: {
    page?: number;
    pageSize?: number;
    numberOfPages?: number;
  }): Promise<string>;
  connect(): Promise<boolean>;
  query(
    script: string,
    values?: Array<unknown>
  ): Promise<{
    rows?: Array<unknown>;
    rowCount?: number;
    rowsAffected?: number[];
    recordset?;
  }>;
  end(): Promise<boolean>;
  getPersistenceInfo(): PersistenceInfo;
}
