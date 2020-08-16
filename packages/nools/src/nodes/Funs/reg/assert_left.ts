import { nodeType, not, from_not, join, exists_from, from, exists, beta, FactObject, Args } from "./import";
import { Regestry } from "../Regestry";

const assert_left: Partial<Record<nodeType, Args<FactObject>>> = {
  [nodeType.beta]: beta.assert_left,
  [nodeType.exists]: exists.assert_left,
  [nodeType.exists_from]: exists_from.assert_left,
  [nodeType.from]: from.assert_left,
  [nodeType.from_not]: from_not.assert_left,
  [nodeType.join]: join.assert_left,
  [nodeType.not]: not.assert_left,
};

Regestry["assert_left"] = assert_left;
