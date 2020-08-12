import * as _parseConstraint from "@nools/parser";

export function parseConstraint(constraint: string) {
  return _parseConstraint.parse(constraint);
}
