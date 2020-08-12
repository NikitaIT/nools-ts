import {
  nodeType,
  not,
  from_not,
  join,
  terminal,
  exists_from,
  from,
  exists,
  type,
  alias,
  beta,
  property,
  equality,
  FactObject,
  Args,
  Fact,
  Context,
  Left,
  Right,
  getAdapterNode,
  AdapterNodeType,
} from "./import";
const retract: Partial<Record<nodeType, typeof base_retract>> = {
  [nodeType.type]: type.retract,
  [nodeType.terminal]: terminal.retract,
  [nodeType.alias]: alias.retract,
  [nodeType.beta]: beta.retract,
  [nodeType.equality]: equality.retract,
  [nodeType.exists]: beta.retract,
  [nodeType.exists_from]: beta.retract,
  [nodeType.from]: beta.retract,
  [nodeType.from_not]: beta.retract,
  [nodeType.join]: beta.retract,
  [nodeType.not]: beta.retract,
  [nodeType.property]: property.retract,
  [nodeType.leftadapter]: getAdapterNode(Left, AdapterNodeType.retract),
  [nodeType.rightadapter]: getAdapterNode(Right, AdapterNodeType.retract),
} as any;
export const base_retract: Args<FactObject, Fact | Context> = function (
  nodes,
  n,
  fact,
  wm
) {
  const node = nodes[n];
  const fun = retract[node.tp];
  if (!fun) {
    console.error(node, fact);
    for (const [outNode, paths] of node.nodes.entries()) {
      base_retract(nodes, outNode, fact, wm);
    }
  } else {
    fun(nodes, n, fact, wm);
  }
};
