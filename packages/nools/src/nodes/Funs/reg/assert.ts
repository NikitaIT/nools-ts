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
  AdapterNodeType,
  Left,
  Right,
} from "./import";
import { Regestry } from "../Regestry";

const assert: Partial<Record<nodeType, Args<FactObject, Fact | Context>>> = {
  [nodeType.type]: type.assert,
  [nodeType.terminal]: terminal.assert,
  [nodeType.alias]: alias.assert,
  [nodeType.beta]: beta.assert,
  [nodeType.equality]: equality.assert,
  [nodeType.exists]: beta.assert,
  [nodeType.exists_from]: beta.assert,
  [nodeType.from]: beta.assert,
  [nodeType.from_not]: beta.assert,
  [nodeType.join]: beta.assert,
  [nodeType.leftadapter]: getAdapterNode(Left, AdapterNodeType.assert),
  [nodeType.not]: beta.assert,
  [nodeType.property]: property.assert,
  [nodeType.rightadapter]: getAdapterNode(Right, AdapterNodeType.assert),
} as any;

Regestry["assert"] = assert;
