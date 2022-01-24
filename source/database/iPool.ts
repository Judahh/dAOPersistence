import { PersistenceInfo, IEventOptions } from 'flexiblepersistence';

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
    values?: Array<unknown>,
    options?: IEventOptions,
    idName?: string
  ): Promise<number>;

  generatePaginationPrefix(
    options?: IEventOptions,
    idName?: string
  ): Promise<string>;

  generatePaginationSuffix(
    options?: IEventOptions,
    idName?: string
  ): Promise<string>;
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
