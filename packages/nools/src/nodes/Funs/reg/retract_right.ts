import { nodeType, not, exists, beta, FactObject, Args } from "./import";
import { Regestry } from "../Regestry";

const retract_right: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.retract_right,
  [nodeType.join]: beta.retract_right,
  [nodeType.exists]: exists.retract_right,
  [nodeType.not]: not.retract_right,
};
Regestry["retract_right"] = retract_right;
