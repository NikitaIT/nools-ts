import { Hash, IPatternOptions } from "../interfaces";
import {
  constraintType,
  IConstraint,
  ITrueConstraint,
  IEqualityConstraint,
  IObjectConstraint,
  IHashConstraint,
  IFromConstraint,
  IReferenceConstraint,
} from "../constraint";

const funcs: Record<constraintType, (constraint: any) => any> = {
  [constraintType.true]: constraint,
  [constraintType.equality]: equality,
  [constraintType.inequality]: equality,
  [constraintType.comparison]: equality,
  [constraintType.object]: obj,
  [constraintType.hash]: constraint,
  [constraintType.from]: from,
  [constraintType.reference]: reference,
  [constraintType.reference_equality]: reference,
  [constraintType.reference_inequality]: reference,
  [constraintType.reference_gt]: reference,
  [constraintType.reference_gte]: reference,
  [constraintType.reference_lt]: reference,
  [constraintType.reference_lte]: reference,
};

function constraint(constraint: ITrueConstraint) {
  delete constraint.assert;
  delete constraint.equal;
  return constraint;
}

function op(options: IPatternOptions) {
  const scope = options.scope;
  const scope2: Hash = (options.scope2 = {});
  if (scope) {
    for (const [k, v] of scope.entries()) {
      scope2[k] = v;
    }
    delete options.scope;
  }
  return options;
}

function equality(constraint: IEqualityConstraint) {
  delete constraint.assert;
  delete constraint.equal;
  constraint.options = op(constraint.options);
  return constraint;
}

function obj(constraint: IObjectConstraint) {
  delete constraint.constraint;
  delete constraint.assert;
  delete constraint.equal;
  return constraint;
}
function from(constraint: IFromConstraint) {
  delete constraint.constraint;
  delete constraint.assert;
  delete constraint.equal;
  constraint.options = op(constraint.options);
  return constraint;
}
function reference(constraint: IReferenceConstraint) {
  delete constraint.assert;
  delete constraint.equal;
  delete constraint.getIndexableProperties;
  constraint.options = op(constraint.options);
  return constraint;
}

export function cst(constraint: IConstraint) {
  const fun = funcs[constraint.tp];
  return fun(constraint);
}
