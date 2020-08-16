import { nools } from "./imports";
import { match } from "./utils";

describe("or", () => {
  it("should fired 3 times.", async () => {
    // arrange
    const rule = createRuleCode();
    const r = {
      count: 0,
    };
    const options = {
      name: "test",
      define: new Map(),
      scope: new Map([["r", r]]),
    };
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession("hello", "world", "hello world", "test"));
    // assert
    expect(r.count).toEqual(3);
  });
});

function createRuleCode() {
  return `
rule test {
	when {
		or(
			s : String s == 'hello',
			s1 : String s1 == 'world',
			s2 : String s2 == 'hello world'
		);
	}
    then {
		++r.count;
    }
}
`;
}
