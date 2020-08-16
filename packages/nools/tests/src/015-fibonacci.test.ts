import { nools, ICompileOptions } from "./imports";
import { match } from "./utils";

//Define our object classes, you can
//also declare these outside of the nools
//file by passing them into the compile method
class Fibonacci {
  public value = -1;
  constructor(public sequence: any) {}
}

class Result {
  public value = -1;
  public result!: number;
  constructor() {}
}

describe("fibonacci", () => {
  let options: ICompileOptions;
  let rule: string;
  let r: Result;
  beforeAll(() => {
    // arrange
    options = {
      name: "test",
      define: new Map<any, any>([
        ["Fibonacci", Fibonacci],
        ["Result", Result],
      ]),
      scope: new Map(),
    };
    rule = createRuleCode();
  });
  beforeEach(() => {
    // arrange
    r = new Result();
  });
  it("classic 10", async () => {
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession(new Fibonacci(10), r));
    // assert
    expect(r.result).toEqual(55);
  });
  it("classic 150", async () => {
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession(new Fibonacci(150), r));
    // assert
    expect(r.result).toEqual(9.969216677189305e30);
  });
  it("classic 1000", async () => {
    // act
    const flow = nools.compile(rule, options);
    await match(flow.getSession(new Fibonacci(1000), r));
    // assert
    expect(r.result).toEqual(4.346655768693743e208);
  });
});

function createRuleCode() {
  return `
		rule Recurse {
			when {
				//you can use not or or methods in here
				not(f : Fibonacci f.sequence == 1);
				//f1 is how you can reference the fact else where
				f1 : Fibonacci f1.sequence != 1;
			}
			then {
				assert(new Fibonacci(f1.sequence - 1));
			}
		}

		rule Bootstrap {
			when {
				f : Fibonacci f.value == -1 && (f.sequence == 1 || f.sequence == 2);
			}
			then{
				f.value = 1;
				modify(f);
			}
		}

		rule Calculate {
			when {
				f1 : Fibonacci f1.value != -1 {sequence : s1};
				//here we define constraints along with a hash so you can reference sequence
				//as s2 else where
				f2 : Fibonacci f2.value != -1 && f2.sequence == s1 + 1 {sequence:s2};
				f3 : Fibonacci f3.value == -1 && f3.sequence == s2 + 1;
				r : Result
			}
			then {
				f3.value = r.result = f1.value + f2.value;
				modify(f3);
				retract(f1);
			}
		}
		`;
}
