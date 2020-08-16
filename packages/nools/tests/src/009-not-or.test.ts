import { FlowContainer, nools } from "./imports";
import { match } from "./utils";

describe("not or", () => {
  let flow: FlowContainer;
  const r: { count?: number } = {};
  beforeAll(() => {
    // arrange
    const rule = createRuleCode();
    const options = {
      name: "test",
      scope: ({ r } as any) as Map<any, any>,
    };
    // act
    flow = nools.compile(rule, options);
  });
  it("should not match", async () => {
    r.count = 0;
    await match(flow.getSession(2, 7));
    expect(r.count).toEqual(0);
  });
  it("should match once", async () => {
    r.count = 0;
    await match(flow.getSession(4, 2));
    expect(r.count).toEqual(1);
  });
  it("should match once", async () => {
    r.count = 0;
    await match(flow.getSession(4, 7));
    expect(r.count).toEqual(1);
  });
  it("should match twice", async () => {
    r.count = 0;
    await match(flow.getSession(4, 5));
    expect(r.count).toEqual(2);
  });
});

function createRuleCode() {
  return `
		rule MultiNotOrRule {
			when {
				or(
					not(n1: Number n1 < 3)
					not(n2: Number n2 > 6)
				)
			}
			then {
				++r.count;
			}
		}
		`;
}
