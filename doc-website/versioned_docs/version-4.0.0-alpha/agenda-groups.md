---
id: agenda-groups
title: Agenda Groups
---

Agenda groups allow for logical groups of rules within a flow.

The agenda manages a `stack` of `agenda-groups` that are currently in focus. The default `agenda-group` is called `main` and all rules that do not have an `agenda-group` specified are placed into the `main` `agenda-group`.

As rules are fired and a particular `agenda-group` runs out of activations then that `agenda-group` is popped from the internal `agenda-group` stack and the next one comes into focus. This continues until `focus` is explicitly called again or the `main` `agenda-group` comes into focus.

**Note** Once an agenda group loses focus it must be re-added to the stack in order for those activations to be focused again.

To add a rule to an agenda-group you can use the `agendaGroup` option.

```javascript
this.rule("Hello World", {agendaGroup: "ag1"}, [Message, "m", "m.name == 'hello'"], function (facts) {
    this.modify(facts.m, function () {
        this.name = "goodbye";
    });
});

this.rule("Hello World2", {agendaGroup: "ag2"}, [Message, "m", "m.name == 'hello'"], function (facts) {
    this.modify(facts.m, function () {
        this.name = "goodbye";
    });
});
```

Or in the dsl

```
rule "Hello World" {
    agenda-group: "ag1";
    when{
        m : Message m.name === 'hello';
    }
    then{
        modify(m, function(){
            this.name = "goodbye";
        });
    }
}
rule "Hello World 2" {
    agenda-group: "ag2";
    when{
        m : Message m.name === 'goodbye';
    }
    then {
        modify(m, function(){
            m.name = "hello";
        });
    }
}
```

In the above rules we have defined two agenda-groups called `ag1` and `ag2`


## Focus

When running your rules and you want a particular agenda group to run you must call `focus` on the session of the flow and specify the `agenda-group` to add to the stack.

```
//assuming a flow with the rules specified above.
var fired = [];
flow.getSession(new Message("hello"))
    .focus("ag1")
    .on("fire", function (ruleName) {
        fired.push(ruleName);
    })
    .match(function () {
        console.log(fired);  //[ 'Hello World' ]
    });
```

Or you can add multiple `agenda-groups` to the focus stack.

```javascript
var fired1 = [], fired2 = [];
flow
    .getSession(new Message("goodbye"))
    .focus("ag1")
    .focus("ag2")
    .on("fire", function (ruleName) {
        fired1.push(ruleName);
    })
    .match(function () {
        console.log("Example 1", fired1); //[ 'Hello World', 'Hello World2' ]
    });
flow
    .getSession(new Message("hello"))
    .focus("ag2")
    .focus("ag1")
    .on("fire", function (ruleName) {
        fired3.push(ruleName);
    })
    .match(function () {
        console.log("Example 2", fired2); //[ 'Hello World', 'Hello World2' ]
    });
```

Notice above that the **last** `agenda-group` focused is added to the array first.


## Auto Focus

Sometimes you may want an `agenda-group` to `auto-focus` whenever a certain rule is activated.

```
this.rule("Bootstrap", [State, "a", "a.name == 'A' && a.state == 'NOT_RUN'"], function (facts) {
    this.modify(facts.a, function () {
        this.state = 'FINISHED';
    });
});

this.rule("A to B",
    [
        [State, "a", "a.name == 'A' && a.state == 'FINISHED'"],
        [State, "b", "b.name == 'B' && b.state == 'NOT_RUN'"]
    ],
    function (facts) {
        this.modify(facts.b, function () {
            this.state = "FINISHED";
        });
    });

this.rule("B to C",
    {agendaGroup: "B to C", autoFocus: true},
    [
        [State, "b", "b.name == 'B' && b.state == 'FINISHED'"],
        [State, "c", "c.name == 'C' && c.state == 'NOT_RUN'"]
    ],
    function (facts) {
        this.modify(facts.c, function () {
            this.state = 'FINISHED';
        });
        this.focus("B to D");
    });

this.rule("B to D",
    {agendaGroup: "B to D"},
    [
        [State, "b", "b.name == 'B' && b.state == 'FINISHED'"],
        [State, "d", "d.name == 'D' && d.state == 'NOT_RUN'"]
    ],
    function (facts) {
        this.modify(facts.d, function () {
        this.state = 'FINISHED';
    });
});
```

Or using the dsl

```
rule Bootstrap {
    when{
        a : State a.name == 'A' && a.state == 'NOT_RUN';
    }
    then{
        modify(a, function(){
            this.state = 'FINISHED';
        });
    }
}


rule 'A to B' {
    when{
        a : State a.name == 'A' && a.state == 'FINISHED';
        b : State b.name == 'B' && b.state == 'NOT_RUN';
    }
    then{
        modify(b, function(){
            this.state = 'FINISHED';
        });
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
        modify(c, function(){
            this.state = 'FINISHED';
        });
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
        modify(d, function(){
            this.state = 'FINISHED';
        });
    }
}
```

In the above rules we created a state machine that has a rule with `auto-focus` set to true.

This allows you to not have to specify `focus` when running the flow.

```javascript
var fired = [];
flow
    .getSession(
        new State("A", "NOT_RUN"),
        new State("B", "NOT_RUN"),
        new State("C", "NOT_RUN"),
        new State("D", "NOT_RUN")
    )
    .on("fire", function (name) {
        fired.push(name);
    })
    .match()
    .then(function () {
        console.log(fired); //["Bootstrap", "A to B", "B to C", "B to D"]
    });
```

