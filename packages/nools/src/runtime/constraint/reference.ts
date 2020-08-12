import { clone, isEqual } from "@nools/lodash-port";
import {
  IConstraint,
  IReferenceConstraint,
  is_instance_of_reference_constraint,
} from "../../constraint";
import { getIndexableProperties, getMatcher } from "../../constraint-matcher";
import { op } from "./op";

export function reference(
  constraint: IReferenceConstraint,
  defines: Map<string, any>,
  scope: Map<string, any>
) {
  const alias = constraint.a;
  const options = op(constraint.options, scope);
  const cst = constraint.constraint;
  const matcher = getMatcher(cst, options, false);
  return {
    options: options,
    op: constraint.op,
    tp: constraint.tp,
    a: alias,
    constraint: cst,
    vars: clone(constraint.vars, true),
    assert(fact: any, fh?: any) {
      return matcher(fact, fh);
    },
    getIndexableProperties() {
      return getIndexableProperties(cst);
    },
    equal(that: IConstraint) {
      return (
        is_instance_of_reference_constraint(that) &&
        isEqual(cst, (that as IReferenceConstraint).constraint)
      );
    },
  };
}
