import { Context } from "../context";
import { FactObject, WorkingMemory } from "../WorkingMemory";
import { INode, INodeWithPatterns } from "../runtime/nodes/types";
export type Args<TObject extends FactObject, TContext = Context> = (
  nodes: Array<INode & INodeWithPatterns>,
  n: number,
  context: TContext,
  wm: WorkingMemory<TObject>
) => void;
