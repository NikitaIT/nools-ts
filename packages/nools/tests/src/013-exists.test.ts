import { nools } from "./imports";
import { match } from "./utils";

describe("exists", () => {
  it("should match", async () => {
    // arrange
    const rule = `
rule test {
	when {
		exists(n1: Number n1 > 2);
	}
	then {
		r.matched = true;
	}
}
`;
    const r = { matched: false };
    const options = {
      name: "test",
      define: new Map(),
      scope: ({ r } as any) as Map<any, any>,
    };
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession(1, 2, 3, 4));
    // assert
    expect(r.matched).toBeTruthy();
  });
});
