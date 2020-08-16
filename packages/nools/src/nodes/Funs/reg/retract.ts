import {
  nodeType,
  terminal,
  type,
  alias,
  beta,
  property,
  equality,
  Left,
  Right,
  getAdapterNode,
  AdapterNodeType,
  FactObject,
  Args,
  Fact,
  Context,
} from "./import";
import { Regestry } from "../Regestry";

const retract: Partial<Record<nodeType, Args<FactObject>>> = {
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
Regestry["retract"] = retract;
