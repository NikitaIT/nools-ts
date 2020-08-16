import { nodeType, not, from_not, join, exists_from, from, exists, beta, FactObject, Args } from "./import";
import { Regestry } from "../Regestry";
const modify_left: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.modify_left,
  [nodeType.exists]: exists.modify_left,
  [nodeType.exists_from]: exists_from.modify_left,
  [nodeType.from]: from.modify_left,
  [nodeType.from_not]: from_not.modify_left,
  [nodeType.join]: join.modify_left,
  [nodeType.not]: not.modify_left,
};
Regestry["modify_left"] = modify_left;
