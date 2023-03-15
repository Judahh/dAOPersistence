import IDAO from './iDAO';
import IDAOSimple from './iDAOSimple';
type ICreateQueryOutput = {
  content: any | IDAOSimple | IDAOSimple[];
  query: string;
  values: unknown[];
  isSimple?: boolean;
};
type IReadQueryOutput = {
  content: any | IDAOSimple | IDAOSimple[];
  query: string;
  values: unknown[];
};
type IUpdateQueryOutput = {
  content: any | IDAO;
  query: string;
  values: unknown[];
  isSimple?: boolean;
};
type IDeleteQueryOutput = {
  defaultOutput: number | boolean;
  query: string;
  values: unknown[];
};

export type {
  ICreateQueryOutput,
  IReadQueryOutput,
  IUpdateQueryOutput,
  IDeleteQueryOutput,
};
