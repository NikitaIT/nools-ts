import { nools } from "./imports";

class Counter {
  constructor(public count = 0) {}
}

describe("fire until halt", () => {
  it("should halt when count to 10000", async () => {
    // arrange
    const rule = createRuleCode<Counter>("Counter", "count");
    const options = {
      name: "test",
      define: new Map([["Counter", Counter]]),
      scope: new Map(),
    };
    // act
    const flow = nools.compile(rule, options);
    const session = flow.getSession();
    await session.match();
    const fact = session.getFact(Counter);
    session.dispose();
    // assert
    expect(fact.count).toEqual(10000);
  });
});

function createRuleCode<T>(className: string, property: keyof T) {
  return `
//We reached our goal
rule "I can count!" {
    when {
        $ctr: ${className} $ctr.${property} == 10000;
    }
    then{
        // console.log("Look ma! I counted to " + $ctr.count);
        halt();
    }
}

//no counter was asserted so create one
rule "not count" {
    when {
        not($ctr: ${className});
    }
    then{
        // console.log("Imma gonna count!");
        assert(new ${className}(1));
    }
}

//A little status update
rule "give them an update" {
    when{
        $ctr: ${className} $ctr.${property} % 1000 == 0 {count: $count}
    }
    then{
        // console.log("Imma countin...", $ctr);
		$ctr.count = $count + 1;
        modify($ctr);
    }
}

//just counting away
rule count {
    when{
        $ctr: ${className} {${property}: $count}
    }
    then{
		$ctr.${property} = $count + 1;
        modify($ctr);
    }
}
`;
}
