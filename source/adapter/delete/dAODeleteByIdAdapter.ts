export default interface DAODeleteAdapter {
  deleteById(id: string): Promise<boolean>;
}
