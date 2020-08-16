import { nools, AgendaGroupEvent } from "./imports";
import { createPushOnlyArray, Message } from "./utils";

// require('should');

describe("salience", () => {
  it("rules should be fired in order", async () => {
    // arrange
    const rule = createRuleCode();
    const options = {
      name: "test",
      define: new Map([["Message", Message]]),
      scope: new Map(),
    };
    // act
    const flow = nools.compile(rule, options);
    const fired = createPushOnlyArray();
    const session = flow.getSession(new Message("hello"));
    await session.on(AgendaGroupEvent.fire, fired.push).match();
    session.dispose();
    // assert
    expect(fired.source).toStrictEqual(["Hello1", "Hello2", "Hello3", "Hello4"]);
  });
});

function createRuleCode() {
  return `
rule Hello4 {
    salience: 7;
    when {
        m: Message m.text == 'hello';
    }
    then {}
}

rule Hello3 {
    salience: 8;
    when {
        m: Message m.text == 'hello';
    }
    then {}
}

rule Hello2 {
    salience: 9;
    when {
        m: Message m.text == 'hello';
    }
    then {}
}

rule Hello1 {
    salience: 10;
    when {
        m: Message m.text == 'hello';
    }
    then {}
}
`;
}
