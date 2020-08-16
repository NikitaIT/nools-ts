import { RuleAfterCompile, RuleBeforeCompile } from "../../rule";
import { AgendaTree, compile_rules, IConstraint, IPattern } from "../import";
import { IBucket, INode, IRootNode } from "../INode";

export interface ITerminalNodeData extends INode {
  i: number;
  n: string;
  b: IBucket;
}

export interface ITerminalNode extends ITerminalNodeData {
  r: RuleAfterCompile;
  agenda: AgendaTree;
}

export interface TerminalNodeData extends ITerminalNodeData {
  r: RuleBeforeCompile;
}
export function terminal(
  node: TerminalNodeData,
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>,
): ITerminalNode {
  const rule = compile_rules(node.r, defines, scope);
  const n: ITerminalNode = {
    id: node.id,
    nodes: node.nodes,
    tp: node.tp,
    ps: node.ps,
    i: node.i,
    n: node.n,
    b: root.bucket!,
    r: rule,
    agenda: agenda,
  };
  agenda.register(n);
  return n;
}
