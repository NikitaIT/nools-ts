import { nodeType, not, from_not, exists_from, from, exists, beta, FactObject, Args } from "./import";
import { Regestry } from "../Regestry";

const retract_left: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.retract_left,
  [nodeType.exists]: exists.retract_left,
  [nodeType.exists_from]: exists_from.retract_left,
  [nodeType.from]: from.retract_left,
  [nodeType.from_not]: from_not.retract_left,
  [nodeType.join]: beta.retract_left,
  [nodeType.not]: not.retract_left,
};
Regestry["retract_left"] = retract_left;
