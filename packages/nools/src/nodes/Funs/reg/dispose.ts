import { nodeType, type, beta, INode, INodeWithPatterns } from "./import";
import { Regestry } from "../Regestry";

const dispose: Partial<Record<nodeType, (nodes: Array<INode & INodeWithPatterns>, n: number) => void>> = {
  [nodeType.type]: type.dispose,
  [nodeType.beta]: beta.dispose,
  [nodeType.exists]: beta.dispose,
  [nodeType.exists_from]: beta.dispose,
  [nodeType.from]: beta.dispose,
  [nodeType.from_not]: beta.dispose,
  [nodeType.join]: beta.dispose,
  [nodeType.not]: beta.dispose,
};

Regestry["dispose"] = dispose;
