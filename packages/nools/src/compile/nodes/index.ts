import { mixin } from "@nools/lodash-port";
import {
  IConstraint,
  IHashConstraint,
  IObjectConstraint,
  IReferenceConstraint,
  is_instance_of_equality,
  is_instance_of_hash,
  is_instance_of_reference_constraint,
} from "../../constraint";
import { Context } from "../../context";
import { Fact } from "../../facts/fact";
import { InitialFact } from "../../facts/initial";
import { IBucket } from "../../interfaces";
import { addConstraint, create_join_reference_node } from "../../nodes/join-reference-node";
import { Memory } from "../../nodes/misc/memory";

import {
  composite_pattern,
  ICompositePattern,
  IFromPattern,
  initial_fact_pattern,
  IObjectPattern,
  IPattern,
  patternType,
} from "../../pattern";
import {
  IAdapterNode,
  IAliasNode,
  IBetaNode,
  IEqualityNode,
  IExistsFromNode,
  IExistsNode,
  IFromNode,
  IFromNotNode,
  IJoinNode,
  INotNode,
  IPropertyNode,
  ITerminalNode,
  ITypeNode,
} from "../../runtime/nodes/types";
import { IAlphaNode, INode, INodeWithSubNodes, IRootNode, nodeType } from "../../runtime/nodes/INode";
import { cst } from "../constraint";
import { pt } from "../pattern";
import { CreatedRule } from "../rule";
import { create_node } from "./create_node";

function create_root_node(cs: IConstraint[]): IRootNode {
  return {
    ns: [],
    ps: [],
    ts: [],
    js: [],
    as: [],
    cs: cs,
    tps: [],
    bucket: {
      counter: 0,
      recency: 0,
    },
  };
}
type NodeWithSubNodes = INode & INodeWithSubNodes;

export const enum Side {
  left = "left",
  right = "right",
}

function create_terminal_node(rules: CreatedRule[], index: number, bucket: IBucket): ITerminalNode {
  const rule = rules[index];
  // @ts-ignore
  return mixin(create_node(nodeType.terminal), {
    i: index,
    r: rule,
    n: rule.n,
    b: bucket,
  });
}

function build_nodes(rules: CreatedRule[], cs: IConstraint[]) {
  const root = create_root_node(cs);
  rules.forEach((rule, idx) => {
    const terminalNode = create_terminal_node(rules, idx, root.bucket);
    // @ts-ignore
    const tn = root.ns.push(terminalNode) - 1;
    __addToNetwork(root, idx, rule.pt, tn);
    __mergeJoinNodes(root);
    root.ts.push(tn);
  });
  return root;
}

function hasRefernceConstraints(pattern: IObjectPattern, cs: IConstraint[]) {
  return (pattern.constraints || []).some((c) => {
    return is_instance_of_reference_constraint(cs[c]);
  });
}

function addOutNode(node: NodeWithSubNodes, outNode: number, pattern: number) {
  node.ns.push([outNode, pattern]);
}

function addParentNode(node: INode, n: number) {
  const parentNodes = node.ps;
  if (parentNodes.indexOf(n) === -1) {
    parentNodes.push(n);
  }
}

function merge(node1: number, node2: number, nodes: NodeWithSubNodes[]) {
  const n1 = nodes[node1];
  const n2 = nodes[node2];
  n2.ns.forEach(([n, p]) => {
    addOutNode(n1, n, p);
  });
  n2.ns = [];
  n2.ps.forEach((parentNode) => {
    addParentNode(n1, parentNode);
    nodes[parentNode].ns = nodes[parentNode].ns.filter(([n]) => {
      return n != node2;
    });
  });
  return n1;
}

function is_instance_of_beta_node(node: INode) {
  switch (node.tp) {
    case nodeType.not:
    case nodeType.exists:
    case nodeType.join:
    case nodeType.from:
    case nodeType.from_not:
    case nodeType.exists_from:
    case nodeType.beta:
      return true;
    default:
      return false;
  }
}

function __mergeJoinNodes(root: IRootNode) {
  const joinNodes = root.js;
  const nodes = root.ns;
  for (let i = 0; i < joinNodes.length; i++) {
    const jj1 = joinNodes[i];
    const jj2 = joinNodes[i + 1];
    const j1 = (nodes[jj1] as any) as IJoinNode;
    const j2 = (nodes[jj2] as any) as IJoinNode;
    if (j1 && j2 && j1.constraint && j2.constraint && j1.constraint.constraint.equal(j2.constraint.constraint)) {
      merge(jj1, jj2, nodes);
      joinNodes.splice(i + 1, 1);
    }
  }
}

function __checkEqual<T extends IAlphaNode>(root: IRootNode, node: T) {
  const constraints = root.as;
  let index = -1;

  if (
    constraints.some((id) => {
      const n = (root.ns[id] as any) as IAlphaNode;
      const r = node.eq(n);
      r && (index = id);
      return r;
    })
  ) {
    return index;
  } else {
    // @ts-ignore
    index = root.ns.push(node) - 1;
    constraints.push(index);
    return index;
  }
}

function create_alpha(type: nodeType, constraint: IConstraint, c: number): IAlphaNode {
  return mixin(create_node(type), {
    constraint: constraint,
    c: c,
    ca: constraint.assert,
    eq(other: IAlphaNode) {
      return constraint.equal(other.constraint);
    },
  });
}

function __createTypeNode(root: IRootNode, constraint: IConstraint, c: number) {
  const typenode = create_alpha(nodeType.type, constraint, c) as ITypeNode;
  const typeNodes = root.tps;
  let index = -1;
  if (
    typeNodes.some((id) => {
      // @ts-ignore
      const typeNode = root.ns[id] as IAlphaNode;
      const r = typenode.constraint.equal(typeNode.constraint);
      r && (index = id);
      return r;
    })
  ) {
    return index;
  } else {
    // @ts-ignore
    index = root.ns.push(typenode) - 1;
    typeNodes.push(index);
    return index;
  }
}

function create_equality_node(constraint: IConstraint, c: number): IEqualityNode {
  return mixin(create_alpha(nodeType.equality, constraint, c), {
    memory: new Map<string, boolean>(),
  });
}

function __createEqualityNode(root: IRootNode, rule: number, constraint: IObjectConstraint, c: number) {
  return __checkEqual(root, create_equality_node(constraint, c));
}

function create_property_node(constraint: IHashConstraint, c: number): IPropertyNode {
  return mixin(create_alpha(nodeType.property, constraint, c), {
    alias: constraint.a,
    constiables: constraint.constraint,
  });
}

function __createPropertyNode(root: IRootNode, rule: number, constraint: IHashConstraint, c: number) {
  return __checkEqual(root, create_property_node(constraint, c));
}

function create_alias_node(root: IRootNode, p: number): IAliasNode {
  const pattern = root.ps[p] as IObjectPattern;
  const alias = pattern.a;
  return mixin(create_node(nodeType.alias), {
    alias: alias,
    constraint: pattern,
    p: p,
    eq(other: IAliasNode) {
      return other.tp == nodeType.alias && alias === other.alias;
    },
  });
}

function __createAliasNode(root: IRootNode, rule: number, pattern: number) {
  // return __checkEqual(new AliasNode(pattern)).addRule(rule);
  return __checkEqual(root, create_alias_node(root, pattern) as any);
}

function create_adapter_node(left: boolean): IAdapterNode {
  return create_node(left ? nodeType.leftadapter : nodeType.rightadapter);
}

function __createAdapterNode(root: IRootNode, rule: number, side: Side = Side.right) {
  const node = create_adapter_node(side === Side.left);
  // @ts-ignore
  return root.ns.push(node) - 1;
}

function _create_beta_node(type: nodeType): IBetaNode {
  return mixin(create_node(type), {
    leftMemory: {},
    rightMemory: {},
    leftTuples: Memory(),
    rightTuples: Memory(),
  });
}

function create_beta_node(): IBetaNode {
  return _create_beta_node(nodeType.beta);
}

function _create_join_node(type: nodeType): IJoinNode {
  const node = _create_beta_node(type);
  const constraint = create_join_reference_node(node.leftTuples, node.rightTuples);
  return mixin(node, {
    constraint: constraint,
  });
}

function create_join_node(): IJoinNode {
  return _create_join_node(nodeType.join);
}

function _create_not_node(type: nodeType): INotNode {
  return mixin(_create_join_node(type), {
    leftTupleMemory: {},
    notMatch: new Context(new InitialFact()).match,
  });
}

function create_not_node(): INotNode {
  return _create_not_node(nodeType.not);
}

function create_exists_node(): IExistsNode {
  return _create_not_node(nodeType.exists);
}

function _create_from_node(root: IRootNode, type: nodeType, pattern: IFromPattern): IFromNode {
  const p = root.ps.push(pattern) - 1;
  const cs = root.cs;
  const type_constraint = cs[pattern.constraints[0]];
  const from = pattern.from;
  const constraints = pattern.constraints.slice(1).map((c) => {
    return cs[c];
  });
  let vars: any[] = [];
  const eqConstraints: {
    (factHanle1: Map<string, Fact>, factHandle2: Map<string, Fact>): boolean;
  }[] = [];
  constraints.forEach((c) => {
    if (is_instance_of_equality(c) || is_instance_of_reference_constraint(c)) {
      eqConstraints.push((factHanle1: Map<string, Fact>, factHandle2: Map<string, Fact>) => {
        return c.assert(factHanle1, factHandle2);
      });
    } else if (is_instance_of_hash(c)) {
      // todo: need debug
      debugger;
      vars = vars.concat((c as IHashConstraint).constraint);
    }
  });
  return mixin(_create_join_node(type), {
    pattern: pattern,
    p: p,
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

function create_from_node(root: IRootNode, pattern: IFromPattern): IFromNode {
  return _create_from_node(root, nodeType.from, pattern);
}

function _create_from_not_node(root: IRootNode, type: nodeType, pattern: IFromPattern): IFromNotNode {
  const p = root.ps.push(pattern) - 1;
  const cs = root.cs;
  const type_constraint = cs[pattern.constraints[0]];
  const from = pattern.from;
  const constraints = pattern.constraints.slice(1).map((c) => {
    return cs[c];
  });
  let vars: any[] = [];
  const eqConstraints: {
    (factHanle1: Map<string, Fact>, factHandle2: Map<string, Fact>): boolean;
  }[] = [];
  constraints.forEach((c) => {
    if (is_instance_of_equality(c) || is_instance_of_reference_constraint(c)) {
      eqConstraints.push(c.assert);
    } else if (is_instance_of_hash(c)) {
      debugger;
      vars = vars.concat((c as IHashConstraint).constraint);
    }
  });
  // @ts-ignore
  return mixin(_create_join_node(type), {
    pattern: pattern,
    p: p,
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

function create_from_not_node(root: IRootNode, pattern: IFromPattern): IFromNotNode {
  return _create_from_not_node(root, nodeType.from_not, pattern);
}

function create_exists_from_node(root: IRootNode, pattern: IFromPattern): IExistsFromNode {
  return _create_from_not_node(root, nodeType.exists_from, pattern);
}

function __createJoinNode(root: IRootNode, rule: number, pattern: ICompositePattern, out_node: number, side: Side) {
  // const p = root.patterns.push(pattern) - 1;
  let joinNode: INode;
  let jn = -1;
  const nodes = root.ns;
  const right_type = pattern.rightPattern.tp;
  if (right_type === patternType.not) {
    joinNode = create_not_node();
    // @ts-ignore
    jn = nodes.push(joinNode) - 1;
  } else if (right_type === patternType.from_exists) {
    joinNode = create_exists_from_node(root, pattern.rightPattern as IFromPattern);
    // @ts-ignore
    jn = nodes.push(joinNode) - 1;
  } else if (right_type === patternType.exists) {
    joinNode = create_exists_node();
    // @ts-ignore
    jn = nodes.push(joinNode) - 1;
  } else if (right_type === patternType.from_not) {
    joinNode = create_from_not_node(root, pattern.rightPattern as IFromPattern);
    // @ts-ignore
    jn = nodes.push(joinNode) - 1;
  } else if (right_type === patternType.from) {
    joinNode = create_from_node(root, pattern.rightPattern as IFromPattern);
    // @ts-ignore
    jn = nodes.push(joinNode) - 1;
  } else if (
    pattern.tp === patternType.composite &&
    !hasRefernceConstraints(pattern.leftPattern as IObjectPattern, root.cs) &&
    !hasRefernceConstraints(pattern.rightPattern as IObjectPattern, root.cs)
  ) {
    const bn = (joinNode = create_beta_node());
    // @ts-ignore
    jn = nodes.push(bn) - 1;
    root.js.push(jn);
  } else {
    joinNode = create_join_node();
    // @ts-ignore
    jn = nodes.push(joinNode) - 1;
    root.js.push(jn);
  }
  let parentNode = joinNode;
  if (is_instance_of_beta_node(nodes[out_node])) {
    const an = __createAdapterNode(root, rule, side);
    // @ts-ignore
    addOutNode(parentNode, an, -1);
    parentNode = nodes[an];
  }
  // @ts-ignore
  addOutNode(parentNode, out_node, -1);
  return jn;
}

function __addToNetwork(root: IRootNode, rule: number, pattern: IPattern, outNode: number, side: Side = Side.left) {
  const type = pattern.tp;
  if (type === patternType.composite) {
    __createBetaNode(root, rule, pattern as ICompositePattern, outNode, side);
  } else if (type !== patternType.initial_fact && side === Side.left) {
    __createBetaNode(root, rule, composite_pattern(initial_fact_pattern(root.cs), pattern), outNode, side);
  } else {
    __createAlphaNode(root, rule, pattern as IObjectPattern, outNode, side);
  }
}

function __createBetaNode(root: IRootNode, rule: number, pattern: ICompositePattern, out_node: number, side: Side) {
  const nodes = root.ns;
  const outNode = nodes[out_node];
  const joinNode = __createJoinNode(root, rule, pattern, out_node, side);
  __addToNetwork(root, rule, pattern.rightPattern, joinNode, Side.right);
  __addToNetwork(root, rule, pattern.leftPattern, joinNode, Side.left);
  addParentNode(outNode, joinNode);
  return joinNode;
}

function __createAlphaNode(root: IRootNode, rule: number, pattern: IObjectPattern, out_node: number, side: Side) {
  const p = root.ps.push(pattern) - 1;
  const type = pattern.tp;
  if (type !== patternType.from && type !== patternType.from_exists && type !== patternType.from_not) {
    const nodes = root.ns;
    const outNode = nodes[out_node];
    const constraints = pattern.constraints;
    const cs = root.cs;
    const tn = __createTypeNode(root, cs[constraints[0]], constraints[0]);
    const typeNode = nodes[tn];
    const an = __createAliasNode(root, rule, p);
    addOutNode(typeNode, an, p);
    addParentNode(nodes[an], tn);
    let parentNode = an;
    constraints
      .filter((constraint, idx) => {
        return idx > 0;
      })
      .forEach((c) => {
        const constraint = cs[c];
        let n = -1;
        if (is_instance_of_hash(constraint)) {
          n = __createPropertyNode(root, rule, constraint as IHashConstraint, c);
        } else if (is_instance_of_reference_constraint(constraint)) {
          addConstraint(
            // @ts-ignore
            (outNode as IJoinNode).constraint,
            constraint as IReferenceConstraint,
          );
          return;
        } else {
          n = __createEqualityNode(root, rule, constraint as IObjectConstraint, c);
        }
        const node = nodes[n];
        addOutNode(nodes[parentNode], n, p);
        addParentNode(node, parentNode);
        parentNode = n;
      });

    if (is_instance_of_beta_node(outNode)) {
      const an = __createAdapterNode(root, rule, side);
      addParentNode(nodes[an], parentNode);
      addOutNode(nodes[parentNode], an, p);
      parentNode = an;
    }
    addParentNode(outNode, parentNode);
    addOutNode(nodes[parentNode], out_node, p);
  }
}

const funcs: Record<nodeType, (node: any) => any> = {
  [nodeType.terminal]: terminal,
  [nodeType.type]: tp,
  [nodeType.equality]: equality,
  [nodeType.property]: property,
  [nodeType.alias]: alias,
  [nodeType.beta]: beta,
  [nodeType.join]: join,
  [nodeType.not]: not,
  [nodeType.exists]: not,
  [nodeType.from]: from,
  [nodeType.from_not]: from,
  [nodeType.exists_from]: from,
} as any;

function terminal(node: ITerminalNode) {
  delete node.b;
  delete node.r.pt;
  return node;
}

function tp(node: ITypeNode) {
  delete node.eq;
  delete node.ca;
  delete node.constraint;
  return node;
}
function equality(node: IEqualityNode) {
  delete node.eq;
  delete node.ca;
  delete node.memory;
  delete node.constraint;
  return node;
}
function property(node: IPropertyNode) {
  delete node.eq;
  delete node.ca;
  delete node.constraint;
  return node;
}
function alias(node: IAliasNode) {
  // @ts-ignore
  delete node.eq;
  // node.constraint = pt(node.constraint);
  delete node.constraint;
  return node;
}
// function adapter(node: IAdapterNode) {
// 	return node;
// }
// funcs.set('leftadapter', adapter);
// funcs.set('rightadapter', adapter);

function beta<T extends IBetaNode>(node: T): T {
  delete node.leftMemory;
  delete node.leftTuples;
  delete node.rightMemory;
  delete node.rightTuples;
  return node;
}
function join(node: IJoinNode) {
  const newNode = beta(node);
  const c = newNode.constraint;
  delete c.leftMemory;
  delete c.rightMemory;
  delete c.equal;
  delete c.isMatch;
  delete c.match;
  const cc = c.constraint;
  delete cc.merge;
  delete cc.getIndexableProperties;
  return newNode;
}
function not(node: INotNode) {
  node = join(node) as INotNode;
  delete node.leftTupleMemory;
  delete node.notMatch;
  return node;
}
function from(node: IFromNode) {
  node = join(node) as IFromNode;
  // node.pattern = pt(node.pattern) as IFromPattern;
  delete node.__equalityConstraints;
  delete node.fromMemory;
  delete node.type_assert;
  delete node.from_assert;
  delete node.pattern;
  return node;
}

export function build(rules: CreatedRule[], cs: IConstraint[]) {
  const root = build_nodes(rules, cs);
  root.ns = root.ns.map((node) => {
    const fun = funcs[node.tp];
    return fun ? fun(node) : node;
  });
  // @ts-ignore
  root.ps = root.ps.map(pt);
  root.cs = cs.map(cst);
  delete root.as;
  delete root.js;
  return root;
}
