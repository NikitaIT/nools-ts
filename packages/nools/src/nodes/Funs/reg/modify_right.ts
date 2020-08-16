import { nodeType, not, join, exists, beta, FactObject, Args } from "./import";
import { Regestry } from "../Regestry";
const modify_right: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.modify_right,
  [nodeType.exists]: exists.modify_right,
  [nodeType.join]: join.modify_right,
  [nodeType.not]: not.modify_right,
};
Regestry["modify_right"] = modify_right;
