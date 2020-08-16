import { nools, AgendaGroupEvent, AgendaGroupTag } from "./imports";
import { createPushOnlyArray, Message } from "./utils";

describe("agenda groups", () => {
  it("should only match ag1", async () => {
    // arrange
    const rule = createRuleCode();
    const options = {
      name: "test",
      define: new Map([
        ["message", Message],
        ["Message", Message],
      ]),
      scope: new Map(),
    };
    // act
    const flow = nools.compile(rule, options);
    const fired = createPushOnlyArray();
    const session = flow.getSession(new Message("hello"));
    await session
      .focus("ag1" as AgendaGroupTag)
      .on(AgendaGroupEvent.fire, fired.push)
      .match();
    const fact = session.getFact(Message);
    session.dispose();
    // assert
    expect(fired.source).toStrictEqual(["Hello World"]);
    expect(fact.text).toEqual("goodbye");
  });
});

function createRuleCode() {
  return `
//find any message that starts with hello
rule 'Hello World' {
	agenda-group: "ag1";
    when {
        m : Message m.text === 'hello';
    }
    then {
		m.text = "goodbye";
        modify(m);
    }
}

//find all messages then end in goodbye
rule Goodbye {
	agenda-group: "ag2";
    when {
        m : Message m.text === 'goodbye';
    }
    then {
		m.text = "hello";
        modify(m);
        console.log(m.text);
    }
}
`;
}
