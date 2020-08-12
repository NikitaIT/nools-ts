export class FactNotExistsError extends Error {
  constructor() {
    super("the fact to modify does not exist");
    this.name = "FactNotExistsError";
  }
}
