import { AgendaGroupTag } from "../agenda";
import { ActionRuleData, GroupedRuleData, IFiredRule, RuleData } from "../interfaces";
import { Flow } from "../flow";
import { Match } from "../context";

function parseAction(action: string, defined: Map<string, any>, scope: Map<string, any>): (...args: any) => any {
  const params = ["facts", "flow"];
  if (/next\(.*\)/.test(action)) {
    params.push("next");
  }
  try {
    return new Function("defined, scope", "return " + new Function(params.join(","), action).toString())(
      defined,
      scope,
    );
  } catch (e) {
    throw new Error("Invalid action : " + action + "\n" + e.message);
  }
}

export type RuleBeforeCompile = RuleData & GroupedRuleData<null> & ActionRuleData<false>;
export type RuleAfterCompile<T extends AgendaGroupTag | null = null> = RuleData & IFiredRule & GroupedRuleData<T>;

export function compile_rules(
  rule: RuleBeforeCompile,
  defined: Map<string, any>,
  scope: Map<string, any>,
): RuleAfterCompile {
  const cb = parseAction(rule.action, defined, scope);
  return {
    n: rule.n,
    p: rule.p,
    af: rule.af,
    pt: rule.pt,
    g: rule.g,
    fire(flow: Flow, match: Match) {
      return new Promise((resolve) => {
        resolve(cb.call(flow, match.factHash, flow));
      });
    },
  };
}
