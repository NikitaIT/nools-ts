import { nools, AgendaGroupEvent } from "./imports";
import { createPushOnlyArray } from "./utils";

// require('should');

class State {
  constructor(public name: string, public state: any) {}
}

describe("auto focus", () => {
  it("rule B to C will be auto focused", async () => {
    // arrange
    const rule = createRuleCode();
    const options = {
      name: "test",
      define: new Map([["State", State]]),
      scope: new Map(),
    };
    // act
    const flow = nools.compile(rule, options);
    const fired = createPushOnlyArray();
    const session = flow.getSession(
      new State("A", "NOT_RUN"),
      new State("B", "NOT_RUN"),
      new State("C", "NOT_RUN"),
      new State("D", "NOT_RUN"),
    );
    await session.on(AgendaGroupEvent.fire, fired.push).match();
    session.dispose();
    // assert
    expect(fired.source).toStrictEqual(["Bootstrap", "A to B", "B to C", "B to D"]);
  });
});

function createRuleCode() {
  const ruleBootstrap = `
  rule Bootstrap {
    when{
        a : State a.name == 'A' && a.state == 'NOT_RUN';
    }
    then{
		a.state = 'FINISHED';
        modify(a);
    }
  }
  `;
  return `
${ruleBootstrap}

rule 'A to B' {
    when{
        a : State a.name == 'A' && a.state == 'FINISHED';
        b : State b.name == 'B' && b.state == 'NOT_RUN';
    }
    then{
		b.state = 'FINISHED';
        modify(b);
    }
}

rule 'B to C' {
    agenda-group: 'B to C';
    auto-focus: true;
    when{
        b: State b.name == 'B' && b.state == 'FINISHED';
        c : State c.name == 'C' && c.state == 'NOT_RUN';
    }
    then{
		c.state = 'FINISHED';
        modify(c);
        focus('B to D')
    }
}

rule 'B to D' {
    agenda-group: 'B to D';
    when{
        b: State b.name == 'B' && b.state == 'FINISHED';
        d : State d.name == 'D' && d.state == 'NOT_RUN';
    }
    then{
		d.state = 'FINISHED';
        modify(d);
    }
}
`;
}
