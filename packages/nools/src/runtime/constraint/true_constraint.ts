import { constraintType, IConstraint, ITrueConstraint } from "../../constraint";

export function true_constraint(constraint: ITrueConstraint): ITrueConstraint {
  const alias = constraint.a;
  return {
    tp: constraintType.true,
    a: alias,
    assert() {
      return true;
    },
    equal(that: IConstraint) {
      return that.tp == constraintType.true && alias === that.a;
    },
  };
}
