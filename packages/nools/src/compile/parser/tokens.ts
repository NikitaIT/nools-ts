import { AgendaGroupTag } from "../../agenda";
import {
  ISimpleConstraint,
  INomalConstraint,
  INotConstraint,
  IFromstraint,
  IOrConstraint,
  IContext,
  IRuleContext,
} from "../../interfaces";
import * as utils from "./util";
import { Keywords, parse } from "./parse";

const predicates = ["not", "or", "exists"];
const predicateRegExp = new RegExp(
  "^(" + predicates.join("|") + ") *\\((.*)\\)$",
  "m"
);
const predicateBeginExp = new RegExp(
  " *(" + predicates.join("|") + ") *\\(",
  "g"
);

function isWhiteSpace(str: string) {
  return str.replace(/[\s|\n|\r|\t]/g, "").length === 0;
}

function joinFunc(m: string, str: string) {
  return "; " + str;
}

function splitRuleLineByPredicateExpressions(ruleLine: string) {
  const str = ruleLine.replace(/,\s*(\$?\w+\s*:)/g, joinFunc);
  const parts = str.split(predicateBeginExp).filter((str) => {
    return str !== "";
  });

  const l = parts.length;
  if (l) {
    const ret: string[] = [];
    for (let i = 0; i < l; ++i) {
      const part = parts[i];
      if (predicates.indexOf(part) !== -1) {
        ret.push([part, "(", parts[++i].replace(/, *$/, "")].join(""));
      } else {
        ret.push(part.replace(/, *$/, ""));
      }
    }
    return ret.join(";");
  } else {
    return str;
  }
}

const salienceRegexp = /^(salience|priority)\s*:\s*(-?\d+)\s*[,;]?/;
const agendaGroupRegexp = /^(agenda-group|agendaGroup)\s*:\s*([a-zA-Z_$][0-9a-zA-Z_$]*|"[^"]*"|'[^']*')\s*[,;]?/;
const autoFocusRegexp = /^(auto-focus|autoFocus)\s*:\s*(true|false)\s*[,;]?/;

const ruleRegExp = /^(\$?\w+) *: *(\w+)(.*)/;

const constraintRegExp = /(\{ *(?:["']?\$?\w+["']?\s*:\s*["']?\$?\w+["']? *(?:, *["']?\$?\w+["']?\s*:\s*["']?\$?\w+["']?)*)+ *\})/;
const fromRegExp = /(\bfrom\s+.*)/;
function parseRules(str: string) {
  const constraints: (
    | ISimpleConstraint
    | INomalConstraint
    | INotConstraint
    | IFromstraint
    | IOrConstraint
  )[] = [];
  const ruleLines = str.split(";"),
    l = ruleLines.length;
  let ruleLine: string;
  for (
    let i = 0;
    i < l &&
    (ruleLine = ruleLines[i].replace(/^\s*|\s*$/g, "").replace(/\n/g, ""));
    i++
  ) {
    if (!isWhiteSpace(ruleLine)) {
      let constraint = ([] as unknown) as
        | ISimpleConstraint
        | INomalConstraint
        | INotConstraint
        | IFromstraint
        | IOrConstraint;
      if (predicateRegExp.test(ruleLine)) {
        // "not", "or", "exists"
        const m = ruleLine.match(predicateRegExp);
        if (!m) {
          throw new SyntaxError(
            `RuleLine: "${ruleLine}", not match: ${predicates}`
          );
        }
        const pred = m[1].replace(/^\s*|\s*$/g, "");
        (constraint as IOrConstraint).push(pred);
        ruleLine = m[2].replace(/^\s*|\s*$/g, "");
        if (pred === "or") {
          constraints.push(
            (constraint as IOrConstraint).concat(
              parseRules(splitRuleLineByPredicateExpressions(ruleLine))
            ) as IOrConstraint
          );
          continue;
        }
      }
      const parts = ruleLine.match(ruleRegExp);
      if (parts && parts.length) {
        (constraint as ISimpleConstraint).push(parts[2], parts[1]);
        let _constraints = parts[3].replace(/^\s*|\s*$/g, "");
        const hashParts = _constraints.match(constraintRegExp);
        let frm: string | null = null;
        if (hashParts) {
          const hash = hashParts[1];
          let _constraint = _constraints.replace(hash, "");
          if (fromRegExp.test(_constraint)) {
            const fromMatch = _constraint.match(fromRegExp);
            if (!fromMatch) {
              throw new SyntaxError(
                `RuleLine: "${ruleLine}" in constraint: "${_constraint}", not match: "from"`
              );
            }
            frm = fromMatch[0];
            _constraint = _constraint.replace(fromMatch[0], "");
          }
          if (_constraint) {
            (constraint as ISimpleConstraint).push(
              _constraint.replace(/^\s*|\s*$/g, "")
            );
          }
          if (hash) {
            (constraint as ISimpleConstraint).push(
              eval(
                "(" +
                  hash.replace(/(\$?\w+)\s*:\s*(\$?\w+)/g, '"$1" : "$2"') +
                  ")"
              )
            );
          }
        } else if (_constraints && !isWhiteSpace(_constraints)) {
          if (fromRegExp.test(_constraints)) {
            const fromMatch = _constraints.match(fromRegExp);
            if (!fromMatch) {
              throw new SyntaxError(
                `RuleLine: "${ruleLine}" in constraints: "${_constraints}", not match: "from"`
              );
            }
            frm = fromMatch[0];
            _constraints = _constraints.replace(fromMatch[0], "");
          }
          (constraint as IFromstraint).push(_constraints);
        }
        if (frm) {
          (constraint as IFromstraint).push(frm);
        }
        constraints.push(constraint);
      } else {
        throw new Error("Invalid constraint " + ruleLine);
      }
    }
  }
  return constraints;
}

function salience(src: string, context: IRuleContext) {
  if (salienceRegexp.test(src)) {
    const parts = src.match(salienceRegexp);
    if (!parts) {
      throw new SyntaxError(`Src: "${src}", not match: "salience|priority"`);
    }
    const priority = parseInt(parts[2], 10);
    if (!isNaN(priority)) {
      context.options.priority = priority;
    } else {
      throw new Error("Invalid salience/priority " + parts[2]);
    }
    return src.replace(parts[0], "");
  } else {
    throw new Error("invalid format");
  }
}
function agendaGroup(src: string, context: IRuleContext) {
  if (agendaGroupRegexp.test(src)) {
    const parts = src.match(agendaGroupRegexp)!,
      agendaGroup = parts[2];
    if (agendaGroup) {
      context.options.agendaGroup = agendaGroup.replace(
        /^["']|["']$/g,
        ""
      ) as AgendaGroupTag;
    } else {
      throw new Error("Invalid agenda-group " + parts[2]);
    }
    return src.replace(parts[0], "");
  } else {
    throw new Error("invalid format");
  }
}

function autoFocus(src: string, context: IRuleContext) {
  if (autoFocusRegexp.test(src)) {
    const parts = src.match(autoFocusRegexp)!,
      autoFocus = parts[2];
    if (autoFocus) {
      context.options.autoFocus = autoFocus === "true" ? true : false;
    } else {
      throw new Error("Invalid auto-focus " + parts[2]);
    }
    return src.replace(parts[0], "");
  } else {
    throw new Error("invalid format");
  }
}

function when(orig: string, context: IRuleContext) {
  /*jshint evil:true*/
  let src = orig.replace(/^when\s*/, "").replace(/^\s*|\s*$/g, "");
  if (utils.findNextToken(src) === "{") {
    const body = utils.getTokensBetween(src, "{", "}", true).join("");
    src = src.replace(body, "");
    context.constraints = parseRules(body.replace(/^\{\s*|\}\s*$/g, ""));
    return src;
  } else {
    throw new Error(
      "unexpected token : expected : '{' found : '" +
        utils.findNextToken(src) +
        "'"
    );
  }
}

function then(orig: string, context: IRuleContext) {
  if (!context.action) {
    let src = orig.replace(/^then\s*/, "").replace(/^\s*|\s*$/g, "");
    if (utils.findNextToken(src) === "{") {
      const body = utils.getTokensBetween(src, "{", "}", true).join("");
      src = src.replace(body, "");
      if (!context.action) {
        context.action = body.replace(/^\{\s*|\}\s*$/g, "");
      }
      if (!isWhiteSpace(src)) {
        throw new Error("Error parsing then block " + orig);
      }
      return src;
    } else {
      throw new Error(
        "unexpected token : expected : '{' found : '" +
          utils.findNextToken(src) +
          "'"
      );
    }
  } else {
    throw new Error("action already defined for rule" + context.name);
  }
}
const ruleTokens: Keywords<IRuleContext> = new Map<
  string,
  (orig: string, context: IRuleContext) => string
>();

ruleTokens.set("salience", salience);
ruleTokens.set("priority", salience);
ruleTokens.set("agendaGroup", agendaGroup);
ruleTokens.set("agenda-group", agendaGroup);
ruleTokens.set("autoFocus", autoFocus);
ruleTokens.set("auto-focus", autoFocus);
ruleTokens.set("when", when);
ruleTokens.set("then", then);

function comment(orig: string, context: IContext) {
  if (orig.match(/^\/\*/)) {
    // Block Comment parse
    return orig.replace(/\/\*.*?\*\//, "");
  } else {
    return orig;
  }
}

function def(orig: string, context: IContext) {
  let src = orig.replace(/^define\s*/, "");
  const name = src.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*)/);
  if (name) {
    src = src.replace(name[0], "").replace(/^\s*|\s*$/g, "");
    if (utils.findNextToken(src) === "{") {
      const body = utils.getTokensBetween(src, "{", "}", true).join("");
      src = src.replace(body, "");
      //should
      context.define.push({ name: name[1], properties: "(" + body + ")" });
      return src;
    } else {
      throw new Error(
        "unexpected token : expected : '{' found : '" +
          utils.findNextToken(src) +
          "'"
      );
    }
  } else {
    throw new Error("missing name");
  }
}

function glbl(orig: string, context: IContext) {
  let src = orig.replace(/^global\s*/, "");
  const name = src.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*\s*)/);
  if (name) {
    src = src.replace(name[0], "").replace(/^\s*|\s*$/g, "");
    if (utils.findNextToken(src) === "=") {
      const fullbody = utils.getTokensBetween(src, "=", ";", true).join("");
      let body = fullbody.substring(1, fullbody.length - 1);
      body = body.replace(/^\s+|\s+$/g, "");
      if (/^require\(/.test(body)) {
        body = "";
        // do not support `require` nools file
        // const file = utils.getParamList(body.replace("require", undefined)).replace(/[\(|\)]/g, "").split(",");
        // if (file.length === 1) {
        // 	//handle relative require calls
        // 	file = file[0].replace(/["|']/g, "");
        // 	body = ["require('", utils.resolve(context.file || process.cwd(), file), "')"].join("");
        // }
      }
      context.scope.push({
        name: name[1].replace(/^\s+|\s+$/g, ""),
        body: body,
      });
      src = src.replace(fullbody, "");
      return src;
    } else {
      throw new Error(
        "unexpected token : expected : '=' found : '" +
          utils.findNextToken(src) +
          "'"
      );
    }
  } else {
    throw new Error("missing name");
  }
}

function fun(orig: string, context: IContext) {
  let src = orig.replace(/^function\s*/, "");
  //parse the function name
  const name = src.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*)\s*/);
  if (name) {
    src = src.replace(name[0], "");
    if (utils.findNextToken(src) === "(") {
      const params = utils.getParamList(src);
      src = src.replace(params, "").replace(/^\s*|\s*$/g, "");
      if (utils.findNextToken(src) === "{") {
        const body = utils.getTokensBetween(src, "{", "}", true).join("");
        src = src.replace(body, "");
        //should
        context.scope.push({ name: name[1], body: "function" + params + body });
        return src;
      } else {
        throw new Error(
          "unexpected token : expected : '{' found : '" +
            utils.findNextToken(src) +
            "'"
        );
      }
    } else {
      throw new Error(
        "unexpected token : expected : '(' found : '" +
          utils.findNextToken(src) +
          "'"
      );
    }
  } else {
    throw new Error("missing name");
  }
}

function rule(orig: string, context: IContext) {
  let src = orig.replace(/^rule\s*/, "");
  const name = src.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*|"[^"]*"|'[^']*')/);
  if (name) {
    src = src.replace(name[0], "").replace(/^\s*|\s*$/g, "");
    if (utils.findNextToken(src) === "{") {
      const rule = {
        name: name[1].replace(/^["']|["']$/g, ""),
        options: {},
        constraints: [],
        action: "",
      } as IRuleContext;
      const body = utils.getTokensBetween(src, "{", "}", true).join("");
      src = src.replace(body, "");
      parse({
        src: body.replace(/^\{\s*|\}\s*$/g, ""),
        keywords: ruleTokens,
        context: rule,
      });
      context.rules.push(rule);
      return src;
    } else {
      throw new Error(
        "unexpected token : expected : '{' found : '" +
          utils.findNextToken(src) +
          "'"
      );
    }
  } else {
    throw new Error("missing name");
  }
}

export const topLevelTokens = new Map<
  string,
  (orig: string, context: IContext) => string
>();
topLevelTokens.set("/", comment);
topLevelTokens.set("define", def);
topLevelTokens.set("global", glbl);
topLevelTokens.set("function", fun);
topLevelTokens.set("rule", rule);
