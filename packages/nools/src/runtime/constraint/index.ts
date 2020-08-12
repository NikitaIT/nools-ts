import { constraintType, IConstraint } from "../../constraint";
import { equality } from "./equality";
import { from } from "./from";
import { hash } from "./hash";
import { obj } from "./obj";
import { reference } from "./reference";
import { true_constraint } from "./true_constraint";

const funcs = new Map<
  constraintType,
  (
    constraint: IConstraint,
    defines: Map<string, any>,
    scope: Map<string, any>
  ) => IConstraint
>([
  [constraintType.true, true_constraint],
  [constraintType.equality, equality],
  [constraintType.inequality, equality],
  [constraintType.comparison, equality],
  [constraintType.object, obj],
  [constraintType.hash, hash],
  [constraintType.from, from],
  [constraintType.reference, reference],
  [constraintType.reference_equality, reference],
  [constraintType.reference_inequality, reference],
  [constraintType.reference_gt, reference],
  [constraintType.reference_gte, reference],
  [constraintType.reference_lt, reference],
  [constraintType.reference_lte, reference],
  [constraintType.reference, reference],
  [constraintType.reference, reference],
  [constraintType.reference, reference],
] as any);

export function cst(
  constraint: IConstraint,
  defines: Map<string, any>,
  scope: Map<string, any>
) {
  const fun = funcs.get(constraint.tp)!;
  return fun(constraint, defines, scope);
}
