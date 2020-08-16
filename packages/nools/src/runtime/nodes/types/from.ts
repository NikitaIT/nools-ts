import { mixin } from "@nools/lodash-port";
import {
  AgendaTree,
  Context,
  Fact,
  IConstraint,
  IFromPattern,
  IPattern,
  is_instance_of_equality,
  is_instance_of_reference_constraint,
} from "../import";
import { IRootNode } from "../INode";
import { IJoinNode, join } from "./join";

export interface IFromNode extends IJoinNode {
  pattern: IFromPattern;
  p: number;
  alias: string;
  type_assert: (type: any) => boolean;
  from_assert: (fact: any, fh?: any) => any;
  constraints: IConstraint[];
  fromMemory: { [id: number]: { [hashCode: string]: [Context, Context] } };
  __equalityConstraints: {
    (factHanle1: Map<string, Fact>, factHandle2: Map<string, Fact>): boolean;
  }[];
  __variables: any[];
}
export function from(
  node: IFromNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[],
): IFromNode {
  // const pattern = pt(node.pattern, defines, scope) as IFromPattern;
  const pattern = patterns[node.p] as IFromPattern;
  const type_constraint = cs[pattern.constraints[0]];
  const from = pattern.from;
  const eqConstraints: {
    (factHanle1: Map<string, Fact>, factHandle2: Map<string, Fact>): boolean;
  }[] = [];
  const constraints = pattern.constraints.slice(1);
  constraints.forEach((cc) => {
    const c = cs[cc];
    if (is_instance_of_equality(c) || is_instance_of_reference_constraint(c)) {
      eqConstraints.push((factHanle1: Map<string, Fact>, factHandle2: Map<string, Fact>) => {
        return c.assert(factHanle1, factHandle2);
      });
    }
  });
  const vars = node.__variables;
  node = (join(node, root, agenda, defines, scope, patterns, cs) as IJoinNode) as IFromNode;
  return mixin(node, {
    pattern: pattern,
    alias: pattern.a,
    constraints: constraints,
    __equalityConstraints: eqConstraints,
    __variables: vars,
    fromMemory: {},
    type_assert(type: any) {
      return type_constraint.assert(type);
    },
    from_assert(fact: any, fh?: any) {
      return from.assert(fact, fh);
    },
  });
}
