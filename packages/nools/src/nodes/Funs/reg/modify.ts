import {
  nodeType,
  terminal,
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
import { Regestry } from "../Regestry";

const modify: Partial<Record<nodeType, Args<FactObject>>> = {
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
Regestry["modify"] = modify;
