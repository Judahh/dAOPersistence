export default interface DAODeleteAdapter {
  delete(filter, single: boolean): Promise<number>;
}
