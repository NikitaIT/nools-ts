import { nodeType, type, beta, INode, INodeWithPatterns } from "./import";

const dispose: Partial<Record<nodeType, typeof base_dispose>> = {
  [nodeType.type]: type.dispose,
  [nodeType.beta]: beta.dispose,
  [nodeType.exists]: beta.dispose,
  [nodeType.exists_from]: beta.dispose,
  [nodeType.from]: beta.dispose,
  [nodeType.from_not]: beta.dispose,
  [nodeType.join]: beta.dispose,
  [nodeType.not]: beta.dispose,
};

export function base_dispose(
  nodes: Array<INode & INodeWithPatterns>,
  n: number
) {
  const node = nodes[n];
  const fun = dispose[node.tp];
  if (!fun) {
    for (const [outNode, value] of node.nodes.entries()) {
      base_dispose(nodes, outNode);
    }
  } else {
    fun(nodes, n);
  }
}
