import { FactObject, WorkingMemory } from "../WorkingMemory";
import { Fact } from "../facts/fact";
import {
  INode,
  INodeWithPatterns,
  IRootNode,
  ITerminalNode,
} from "../runtime/nodes/types";
import { Args } from "./Args";
import { base_assert, base_dispose, base_modify, base_retract } from "./Funs";

export class RootNode {
  assertFact<TObject extends FactObject>(
    root: IRootNode,
    fact: Fact,
    wm: WorkingMemory<TObject>
  ) {
    forTps(root, (typeNode) =>
      base_assert(
        root.ns as Array<INode & INodeWithPatterns>,
        typeNode,
        fact,
        wm
      )
    );
  }

  retractFact<TObject extends FactObject>(
    root: IRootNode,
    fact: Fact,
    wm: WorkingMemory<TObject>
  ) {
    forTps(root, (typeNode) =>
      base_retract(
        root.ns as Array<INode & INodeWithPatterns>,
        typeNode,
        fact,
        wm
      )
    );
  }

  modifyFact<TObject extends FactObject>(
    root: IRootNode,
    fact: Fact,
    wm: WorkingMemory<TObject>
  ) {
    forTps(root, (typeNode) =>
      base_modify(
        root.ns as Array<INode & INodeWithPatterns>,
        typeNode,
        fact,
        wm
      )
    );
  }

  dispose(root: IRootNode) {
    forTps(root, (typeNode) =>
      base_dispose(root.ns as Array<INode & INodeWithPatterns>, typeNode)
    );
  }

  containsRule(root: IRootNode, name: string) {
    return root.ts.some((id) => {
      const terminalNode = (root.ns[id] as any) as ITerminalNode;
      return terminalNode.r.n === name;
    });
  }
}

function forTps(root: IRootNode, fn: (x: number) => void) {
  return root.tps.forEach(fn);
}
