import { keys, isString } from "@nools/lodash-port";

import { InitialFact } from "./facts/initial";
import { to_map } from "./lang";
export function get_defines(d?: Map<string, any>) {
  return withPredefined(to_map(d));
}
export function withPredefined(defines: Map<string, any>) {
  defines.set("Array", Array);
  defines.set("array", Array);
  defines.set("String", String);
  defines.set("string", String);
  defines.set("Number", Number);
  defines.set("number", Number);
  defines.set("Boolean", Boolean);
  defines.set("boolean", Boolean);
  defines.set("RegExp", RegExp);
  defines.set("regexp", RegExp);
  defines.set("reg", RegExp);
  defines.set("Date", Date);
  defines.set("date", Date);
  defines.set("Object", Object);
  defines.set("object", Object);
  defines.set("InitialFact", InitialFact);
  defines.set("initialfact", InitialFact);
  // if (typeof Buffer !== "undefined") {
  // 	defines.set('Buffer', Buffer);
  // 	defines.set('buffer', Buffer);
  // }
  return defines;
}

export function createFunction(body: string, defined: Map<string, any>, scope: Map<string, any>) {
  const declares: string[] = [];
  defined.forEach((v, k) => {
    if (body.indexOf(k) !== -1) {
      declares.push(`const ${k}= defined.get('${k}');`);
    }
  });
  scope.forEach((v, k) => {
    if (body.indexOf(k) !== -1) {
      declares.push(`const ${k}= scope.get('${k}');`);
    }
  });

  body = ["((function(){", declares.join(""), "\n\treturn ", body, "\n})())"].join("");
  try {
    return eval(body);
  } catch (e) {
    throw new Error("Invalid action : " + body + "\n" + e.message);
  }
}

export function createDefined(action: string | any, defined: Map<string, any>, scope: Map<string, any>) {
  if (isString(action)) {
    const declares = keys(defined)
      .filter((name) => {
        return action.indexOf(name) !== -1;
      })
      .map((name) => {
        return `var ${name}=defined.get('${name}');`;
      })
      .concat(
        keys(scope)
          .filter((name) => {
            return action.indexOf(name) !== -1;
          })
          .map((name) => {
            return `var ${name}= function(){var prop=scope.get('${name}'); return __objToStr__.call(prop)==='[object Function]' ? prop.apply(void 0, arguments) : prop;};`;
          }),
      );

    if (declares.length) {
      declares.unshift("var __objToStr__ = Object.prototype.toString;");
    }
    action = [declares.join(""), "return ", action, ";"].join("");
    action = new Function("defined", "scope", action)(defined, scope);
  }
  const ret =
    action.hasOwnProperty("constructor") && "function" === typeof action.constructor
      ? action.constructor
      : function (opts: any) {
          opts = opts || {};
          for (const i in opts) {
            if (i in action) {
              ret[i] = opts[i];
            }
          }
        };
  const proto = ret.prototype;
  for (const i in action) {
    proto[i] = action[i];
  }
  return ret;
}
