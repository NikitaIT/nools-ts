import { nodeType, not, join, exists, beta, FactObject, Args } from "./import";
import { Regestry } from "../Regestry";

const assert_right: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.assert_right,
  [nodeType.exists]: exists.assert_right,
  [nodeType.join]: join.assert_right,
  [nodeType.not]: not.assert_right,
};

Regestry["assert_right"] = assert_right;
