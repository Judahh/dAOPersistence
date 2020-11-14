export class PersistenceFunction {
  private name: string;
  private statements: string[];

  constructor(name: string, statements?: string[]) {
    this.name = name;
    if (statements) {
      this.statements = statements;
    } else {
      this.statements = [];
    }
  }

  toString(): string {
    return `${this.name}(${this.statements.toString()})`;
  }
}
