import { nools, c, rt, ICompileOptions } from "./imports";
import { match, Message } from "./utils";

describe("hello world", () => {
  let r: any;
  beforeAll(() => {
    r = JSON.parse(JSON.stringify(compileRule(c, createRuleCode<Message>("Message", "text"))));
  });
  it("basic", async () => {
    const flow = compileRule(nools, createRuleCode<Message>("Message", "text"));
    const m = new Message("hello world");
    await match(flow.getSession(m));
    expect(m.text).toEqual("hello world goodbye");
  });
  it("use json", async () => {
    const options = {
      name: "test",
      define: new Map([
        ["message", Message],
        ["Message", Message],
      ]),
      scope: new Map(),
    };
    const flow = compileRule(rt, r);
    const m = new Message("hello world");
    await match(flow.getSession(m));
    expect(m.text).toEqual("hello world goodbye");
  });
  it("use object as scope and defines", async () => {
    const flow = rt.compile(r, {
      name: "test",
      define: { Message } as any,
      scope: new Map(),
    });
    const m = new Message("hello world");
    await match(flow.getSession(m));
    expect(m.text).toEqual("hello world goodbye");
  });
});
type ICompiler<T> = { compile(src: T, options: ICompileOptions): any };
function compileRule<T>(compiler: ICompiler<T>, rule: T) {
  const options = {
    name: "test",
    define: new Map([
      ["message", Message],
      ["Message", Message],
    ]),
    scope: new Map(),
  };
  if (!compiler.compile) {
    console.log(compiler);
  }
  return compiler.compile(rule, options);
}

function createRuleCode<T>(className: string, property: keyof T) {
  return `
		//find any message that starts with hello
		rule Hello {
			when {
				m : ${className} m.${property} =~ /^hello(\\s*world)?$/;
			}
			then {
				m.${property} += " goodbye";
				modify(m);
			}
		}

		//find all messages then end in goodbye
		rule Goodbye {
			when {
				m : ${className} m.${property} =~ /.*goodbye$/;
			}
			then {
				// console.log(m.${property});
			}
		}
		`;
}
