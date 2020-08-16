import { mixin } from "@nools/lodash-port";
import { AgendaTree, Context, IConstraint, ILinkNode, InitialFact, IPattern, Match } from "../import";
import { IRootNode } from "../INode";
import { IJoinNode, join } from "./join";

export interface INotNode extends IJoinNode {
  leftTupleMemory: { [hashCode: string]: ILinkNode<Context> };
  notMatch: Match;
}
export type IExistsNode = INotNode;
export function not(
  node: INotNode,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
  patterns: IPattern[],
  cs: IConstraint[],
): INotNode {
  node = join(node, root, agenda, defines, scope, patterns, cs) as INotNode;
  return mixin(node, {
    leftTupleMemory: {},
    notMatch: new Context(new InitialFact()).match,
  });
}
