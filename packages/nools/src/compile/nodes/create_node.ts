import { INode, INodeWithSubNodes, nodeType } from "../../runtime/nodes/INode";

let id = 0;
export function create_node(type: nodeType): INode & INodeWithSubNodes {
  return {
    tp: type,
    ns: [],
    id: id++,
    ps: [],
  };
}
