import { Context } from "../context";
import { INode, ITerminalNode } from "../runtime/nodes/types";

export class TerminalNode {
  assert(nodes: INode[], n: number, context: Context) {
    const node = nodes[n] as ITerminalNode;
    const match = context.match;
    if (match.isMatch) {
      const rule = node.r,
        bucket = node.b;
      node.agenda.insert(node, {
        rule: rule,
        hashCode: context.hashCode,
        index: node.i,
        name: rule.n,
        recency: bucket.recency++,
        match: match,
        counter: bucket.counter,
      });
    }
  }
  modify(nodes: INode[], n: number, context: Context) {
    const node = nodes[n] as ITerminalNode;
    node.agenda.retract(node, context);
    this.assert(nodes, n, context);
  }
  retract(nodes: INode[], n: number, context: Context) {
    const node = nodes[n] as ITerminalNode;
    node.agenda.retract(node, context);
  }
}
export const terminalNodeUtils = new TerminalNode();
