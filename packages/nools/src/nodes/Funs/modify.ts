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
  getAdapterNode,
  Right,
  AdapterNodeType,
  Left,
} from "./import";

const modify: Partial<Record<nodeType, typeof base_modify>> = {
  [nodeType.type]: type.modify,
  [nodeType.terminal]: terminal.modify,
  [nodeType.alias]: alias.modify,
  [nodeType.beta]: beta.modify,
  [nodeType.equality]: equality.modify,
  [nodeType.exists]: beta.modify,
  [nodeType.exists_from]: beta.modify,
  [nodeType.from]: beta.modify,
  [nodeType.from_not]: beta.modify,
  [nodeType.join]: beta.modify,
  [nodeType.not]: beta.modify,
  [nodeType.property]: property.modify,
  [nodeType.leftadapter]: getAdapterNode(Left, AdapterNodeType.modify),
  [nodeType.rightadapter]: getAdapterNode(Right, AdapterNodeType.modify),
} as any;

export const base_modify: Args<FactObject, Fact | Context> = function (
  nodes,
  n,
  fact,
  wm
) {
  const node = nodes[n];
  const fun = modify[node.tp];
  if (!fun) {
    console.error(node, fact);
    for (const [outNode, paths] of node.nodes.entries()) {
      base_modify(nodes, outNode, fact, wm);
    }
  } else {
    fun(nodes, n, fact, wm);
  }
};
