import { IRuleContext, IContext } from "../../interfaces";
import { findNextTokenIndex } from "./util";

export type Keywords<T extends IContext | IRuleContext> = Map<string, (orig: string, context: T) => string>;
type ParseArgs<T extends IContext | IRuleContext> = {
  src: string;
  keywords: Keywords<T>;
  context: T;
};
export function parse<T extends IContext | IRuleContext>({ src, keywords, context }: ParseArgs<T>): T {
  const orig = src;
  src = src.replace(/(\s+)\/\/(.*)/g, "").replace(/\r\n|\r|\n/g, " ");
  const keys: string[] = [];
  for (const key of keywords.keys()) {
    keys.push(key);
  }
  const blockTypes = new RegExp("^(" + keys.join("|") + ")");
  let index: number;
  // blockTypes = /**/|define|import|global|function|rule
  while (src && (index = findNextTokenIndex(src)) !== -1) {
    src = src.substr(index);
    const matchBlockType = src.match(blockTypes);
    if (matchBlockType !== null) {
      const blockType = matchBlockType[1];
      if (keywords.has(blockType)) {
        try {
          src = keywords.get(blockType)!(src, context).replace(/^\s*|\s*$/g, "");
        } catch (e) {
          throw new Error("Invalid " + blockType + " definition \n" + e.message + "; \nstarting at : " + orig);
        }
      } else {
        throw new Error("Unknown token" + blockType);
      }
    } else {
      throw new Error("Error parsing " + src);
    }
  }
  return context;
}
