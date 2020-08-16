import { mixin } from "@nools/lodash-port";
import { cst } from "../../constraint";
import {
  addConstraint,
  AgendaTree,
  create_join_reference_node,
  IConstraint,
  IJoinReferenceNode,
  IPattern,
} from "../import";
import { beta, IBetaNode } from "./beta";
import { IRootNode } from "../INode";

export interface IJoinNode extends IBetaNode {
  constraint: IJoinReferenceNode;
}
export function join(
  node: IJoinNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[],
): IJoinNode {
  const constraint = node.constraint;
  const betaNode = beta(node);
  const joinReferenceNode = create_join_reference_node(betaNode.leftTuples, betaNode.rightTuples);
  if (!constraint.isDefault) {
    addConstraint(joinReferenceNode, cst(constraint.constraint, defines, scope) as any);
  }
  return mixin(betaNode, {
    constraint: joinReferenceNode,
  });
}
