import { nools, FlowContainer } from "./imports";
import { match } from "./utils";

class Result {
  public min = Infinity;
  constructor() {}
}

describe("not", () => {
  let flow: FlowContainer;
  let r: Result;
  beforeAll(() => {
    // arrange
    const rule = createRuleCode();
    r = new Result();
    const options = {
      name: "test",
      define: new Map(),
      scope: ({ r } as any) as Map<any, any>,
    };
    flow = nools.compile(rule, options);
  });
  it("use scope function [r, 4, 2] min 2", async () => {
    await match(flow.getSession(r, 4, 2));
    expect(r.min).toEqual(2);
  });
  it("use scope function [r, 4, 1, 2, 3] min 1", async () => {
    await match(flow.getSession(r, 4, 1, 2, 3));
    expect(r.min).toEqual(1);
  });
  it("use scope function [r, -4, 3, 2] min -4", async () => {
    await match(flow.getSession(r, -4, 3, 2));
    expect(r.min).toEqual(-4);
  });
});

function createRuleCode() {
  return `
rule test {
	when {
		n1: Number;
		not(n2: Number n1 > n2);
	}
	then {
		r.min = n1;
	}
}
`;
}
