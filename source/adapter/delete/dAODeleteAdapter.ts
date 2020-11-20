export default interface DAODeleteAdapter {
  delete(filter): Promise<boolean>;
}
