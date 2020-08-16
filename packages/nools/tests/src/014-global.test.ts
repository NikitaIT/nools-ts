import { nools } from "./imports";
import { match } from "./utils";

describe("global", () => {
  it("should have properties", async () => {
    // arrange
    const rule = createRuleCode();
    const r = {};
    const options = {
      name: "test",
      define: new Map(),
      scope: new Map([["r", r]]), // notice, must use map here
    };
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession());
    // assert
    expect(Object.keys(r)).toEqual(expect.arrayContaining(["PI", "SOME_STRING", "TRUE", "NUM", "DATE"]));
  });
});

function createRuleCode() {
  return `
global PI = Math.PI;
global SOME_STRING = 'some string';
global TRUE = true;
global NUM = 1.23;
global DATE = new Date();
rule test {
	when {
	}
	then {
		r.PI = PI;
		r.SOME_STRING = SOME_STRING;
		r.TRUE = TRUE;
		r.NUM = NUM;
		r.DATE = DATE;
	}
}
`;
}
