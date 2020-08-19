---
id: flow
title: Defining a flow
---

When using nools you define a **flow** which acts as a container for rules that can later be used to get
a **session**

## Programmatically
```javascript
var nools = require("nools");

var Message = function (message) {
    this.text = message;
};

var flow = nools.flow("Hello World", function (flow) {

    //find any message that is exactly hello world
    flow.rule("Hello", [Message, "m", "m.text =~ /^hello\\sworld$/"], function (facts) {
        facts.m.text = facts.m.text + " goodbye";
        this.modify(facts.m);
    });

    //find all messages then end in goodbye
    flow.rule("Goodbye", [Message, "m", "m.text =~ /.*goodbye$/"], function (facts) {
        console.log(facts.m.text);
    });
});

```

In the above flow definition 2 rules were defined

  * Hello
    * Requires a Message
    * The messages's `text` must match the regular expression `/^hello\\sworld$/`
    * When matched the message's `text` is modified and then we let the engine know that we modified the message.
  * Goodbye
    * Requires a Message
    * The messages's `text` must match the regular expression `/.*goodbye$/`(anything that ends in goodbye)
    * When matched the resulting message is logged.

## DSL

You may also use the `nools` rules language to define your rules.

The following is the equivalent of the rules defined programmatically above.

```
define Message {
    text : '',
    constructor : function(message){
        this.text = message;
    }
}

//find any message that starts with hello
rule Hello {
    when {
        m : Message m.text =~ /^hello(\s*world)?$/;
    }
    then {
        modify(m, function(){this.text += " goodbye";});
    }
}

//find all messages then end in goodbye
rule Goodbye {
    when {
        m : Message m.text =~ /.*goodbye$/;
    }
    then {
        console.log(m.text);
    }
}
```

To use the flow

```javascript
var flow = nools.compile(__dirname + "/helloworld.nools"),
    Message = flow.getDefined("message");
```

## Flow Events

Each flow can have the following events emitted.

* `assert (fact)` - emitted when facts are asserted
* `retract (fact)` - emitted when facts are retracted
* `modify (fact)` - emitted when facts are modified
* `fire (name, rule)` - emitted when an activation is fired.

```
session.on("assert", function(fact){
    //fact was asserted
});

session.on("retract", function(fact){
    //fact was retracted
});

session.on("modify", function(fact){
    //fact was modifed
});

session.on("fire", function(name, rule){
    //a rule was fired.
});
```

## `nools.compile`

The compile method accepts the following parameters

* `source|path` - The first argument must either be a path that ends in `.nools` or a string which is the source of the rules that you wish to compile.
* `options?`
   * `name` : This is the name of the flow. You can use this name to look up the flow by using `nools.getFlow`.
   * `define` : A hash of Classes that should be aviable to the rules that you are compiling.
   * `scope`: A hash of items that should be available to rules as they run. (i.e. a logger)
* `cb?` - an options function to invoke when compiling is done.


**Example**

```
rule "person name is bob" {
    when {
        p : Person p.name == 'bob';
    }
    then {
        logger.info("Found person with name of bob");
        retract(p);
    }
}
```

In the above rules file we make use of a Person class and a logger. In order for nools to properly reference the Class and logger you must specify them in your options.

```typescript
var flow = nools.compile("personFlow.nools", {
    define: {
        //The person class the flow should use
        Person: Person
    },
    scope: {
        //the logger you want your flow to use.
        logger: logger
    }
});
```

You may also compile source directly.

```javascript
var noolsSource = "rule 'person name is bob' {"
    + "   when {"
    + "     p : Person p.name == 'bob';"
    + "   }"
    + "   then {"
    + "       logger.info('Found person with name of bob');"
    + "       retract(p);"
    + "   }"
    + "}";

var flow = nools.compile(noolsSource, {
    define: {
        //The person class the flow should use
        Person: Person
    },
    scope: {
        //the logger you want your flow to use.
        logger: logger
    },
    name: 'person name is bob'
});
```


## Checking If A Flow Exists

To check if a flow currently is registering with `nools` use the `hasFlow` function;

```javascript
var myFlow = nools.flow("flow");

nools.hasFlow("flow"); //true

```
