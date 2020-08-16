import { isBoolean, isArray } from "@nools/lodash-port";
import { AgendaGroupTag } from "../agenda";

import {
  IRuleContextOptions,
  ICondition,
  RuleData,
  GroupedRuleData,
  ActionRuleData,
  IScopedCondition,
} from "../interfaces";
import { pattern, IPattern, composite_pattern } from "../pattern";
import { IConstraint } from "../constraint";

export function createRule(
  name: string,
  options: IRuleContextOptions,
  conditions: ICondition[],
  cs: IConstraint[],
  cb: string,
): CreatedRule[] {
  let isRules = conditions.every(isArray);
  if (isRules && conditions.length === 1) {
    conditions = conditions[0];
    isRules = false;
  }
  const scope = options.scope || new Map<string, any>();
  (conditions as any).scope = scope;
  const createRule = (compositePattern: IPattern) => _create_rule(name, options, compositePattern, cb);
  if (isRules) {
    const patterns = conditions.reduce((patterns, condition) => {
      condition.scope = scope;
      return pattern(condition as ICondition & IScopedCondition, cs).reduce(_mergePatterns, patterns);
    }, [] as IPattern[][]);
    return patterns.map(toRulesFromRulesPatterns(createRule));
  } else {
    return pattern(conditions as ICondition & IScopedCondition, cs).map(createRule);
  }
}
function toRulesFromRulesPatterns(createRule: (compositePattern: IPattern) => any) {
  return (patterns: IPattern[]) => {
    const compositePattern = patterns
      .filter((patt, idx) => {
        return idx > 0;
      })
      .reduce((compPat, patt) => {
        return composite_pattern(compPat, patt);
      }, patterns[0]);
    return createRule(compositePattern);
  };
}
function _mergePatterns(patterns: IPattern[][], patt: IPattern | IPattern[], i: number) {
  // [pattern], [pattern], ...  in arrays of length 1
  // we wish to build a single array in order of lhs progression
  if (isArray(patt)) {
    if ((patt as IPattern[]).length === 1) {
      patt = (patt as IPattern[])[0];
      i = 0;
    } else {
      throw new Error("invalid pattern structure");
    }
  }
  if (!patterns[i]) {
    patterns[i] = i === 0 ? [] : patterns[i - 1].slice();
    //remove dup
    if (i !== 0) {
      patterns[i].pop();
    }
    patterns[i].push(patt as IPattern);
  } else {
    patterns.forEach((p) => {
      p.push(patt as IPattern);
    });
  }
  return patterns;
}
export type CreatedRule = RuleData & GroupedRuleData<null> & ActionRuleData<false>;
function _create_rule(name: string, options: IRuleContextOptions, pattern: IPattern, action: string): CreatedRule {
  let agendaGroup: AgendaGroupTag | null = null;
  let autoFocus = false;
  if (options.agendaGroup) {
    agendaGroup = options.agendaGroup;
    autoFocus = isBoolean(options.autoFocus) ? options.autoFocus : false;
  }
  return {
    n: name,
    pt: pattern,
    p: options.priority || options.salience || 0,
    af: autoFocus,
    action: action,
    g: agendaGroup,
  };
}
