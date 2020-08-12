import { IPatternOptions } from "../../interfaces";

export function op(options: IPatternOptions, scope: Map<string, any>) {
  const scope2 = options.scope2;
  if (scope2) {
    scope = new Map<string, any>(scope);
    for (const name in scope2) {
      scope.set(name, scope2[name]);
    }
  }
  return {
    scope: scope,
    pattern: options.pattern,
    alias: options.alias,
  };
}
