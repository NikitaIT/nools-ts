import { nools } from "./imports";
import { match } from "./utils";

class Person {
  constructor(public firstName: string, public middleName: string, public lastName: string) {}
}

describe("from", () => {
  it("from matched fact", async () => {
    // arrange
    const rule = createRuleCode();
    const r: string[] = [];
    const options = {
      name: "test",
      define: new Map([["Person", Person]]),
      scope: ({ r } as any) as Map<any, any>,
    };
    // act
    const flow = nools.compile(rule, options);
    await match(
      flow.getSession(
        new Person("angula", "juley", "gard"),
        new Person("alice", "munal", "galler"),
        new Person("rose", "", "bing"),
      ),
    );
    // assert
    expect(r).toStrictEqual(["alice", "angula"]);
  });
  it("from array", async () => {
    // arrange
    const rule = `
		rule test {
			when {
				n: Number from [1,2,3,4,5];
			}
			then {
				r.push(n);
			}
		}
		`;
    const r: string[] = [];
    const options = {
      name: "test",
      define: new Map(),
      scope: ({ r } as any) as Map<any, any>,
    };
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession());
    expect(r.length).toEqual(5);
  });
  it("from function", async () => {
    // arrange
    const rule = `
		rule test {
			when {
				n: Number from myarr();
			}
			then {
				r.push(n);
			}
		}
		`;
    const r: string[] = [];
    const options = {
      name: "test",
      define: new Map(),
      scope: ({ r, myarr } as any) as Map<any, any>,
    };
    function myarr() {
      return [1, 2, "abc", 3];
    }
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession());
    // assert
    expect(r.length).toEqual(3);
  });
});

function createRuleCode() {
  return `
rule test {
	when {
		p: Person;
		first: String first =~ /^a/ from p.firstName;
	}
	then {
		r.push(first);
	}
}
`;
}
