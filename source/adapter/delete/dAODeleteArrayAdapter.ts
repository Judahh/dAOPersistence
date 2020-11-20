export default interface DAODeleteArrayAdapter {
  deleteArray(filter): Promise<number>;
}
