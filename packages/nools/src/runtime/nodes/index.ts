import { clone } from "@nools/lodash-port";
import { AgendaTree } from "../../agenda";
import { cst } from "../constraint";
import { pt } from "../pattern";
import { compile_sub_nodes } from "./compile_sub_nodes";
import {
  adapter,
  alias,
  beta,
  from_not,
  join,
  property,
  terminal,
  equality,
  not,
  from,
  tp,
  IRootNode,
  nodeType,
  IBucketed,
} from "./types";

// const funcs = new Map<
//   nodeType,
//   (
//     node: INode,
//     root: IRootNode,
//     agenda: AgendaTree,
//     defines: Map<string, any>,
//     scope: Map<string, any>,
//     patterns: IPattern[],
//     cs: IConstraint[]
//   ) => INode
// >([
// ]);

// no nodeType.join_reference why?
const funcs: Record<nodeType, any> = {
  [nodeType.terminal]: terminal,
  [nodeType.type]: tp,
  [nodeType.equality]: equality,
  [nodeType.property]: property,
  [nodeType.alias]: alias,
  [nodeType.leftadapter]: adapter,
  [nodeType.rightadapter]: adapter,
  [nodeType.beta]: beta,
  [nodeType.join]: join,
  [nodeType.not]: not,
  [nodeType.exists]: not,
  [nodeType.from]: from,
  [nodeType.from_not]: from_not,
  [nodeType.exists_from]: from_not,
} as Record<nodeType, any>;
export function build(
  root: IRootNode,
  agenda: AgendaTree,
  defines: Map<string, any>,
  scope: Map<string, any>
) {
  const patterns = root.ps.map((pattern) => {
    return pt(pattern, defines, scope);
  });
  const cs = root.cs.map((c) => {
    return cst(c, defines, scope);
  });
  const nodes = root.ns.map((node) => {
    node = compile_sub_nodes(patterns, node);
    const fun = funcs[node.tp];
    return fun(node, root, agenda, defines, scope, patterns, cs);
  });
  return {
    ns: nodes,
    ps: patterns,
    cs: cs,
    ts: clone(root.ts),
    js: clone(root.js),
    as: clone(root.as),
    tps: clone(root.tps),
    bucket: clone(root.bucket),
  } as IRootNode & IBucketed;
}
