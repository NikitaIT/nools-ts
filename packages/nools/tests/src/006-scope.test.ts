import { nools } from "./imports";
import { Message } from "./utils";

describe("scope", () => {
  it("use scope function", async () => {
    // arrange
    const rule = createRuleCode();
    const options = {
      name: "test",
      define: new Map([["Message", Message]]),
      scope: new Map([["doesMatch", doesMatch]]),
    };
    function doesMatch(str: string, regex: RegExp) {
      return regex.test(str);
    }
    // act
    const flow = nools.compile(rule, options);
    const session = flow.getSession(new Message("hello world"));
    await session.match();
    const fact = session.getFact(Message);
    session.dispose();
    // assert
    expect(fact.text).toEqual("hello world goodbye");
  });
});

function createRuleCode() {
  return `
rule Hello {
    when {
        m : Message doesMatch(m.text, /^hello\\sworld$/);
    }
    then {
        m.text += " goodbye";
        modify(m);
    }
}

rule Goodbye {
    when {
        m : Message doesMatch(m.text, /.*goodbye$/);
    }
    then {
		// console.log('goodbye');
    }
}
`;
}
