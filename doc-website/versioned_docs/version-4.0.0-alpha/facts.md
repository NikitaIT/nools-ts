---
id: facts
title: Working with facts
---

Facts are items that the rules should try to match.

## Assert

To add facts to the session use `assert` method.

```javascript
session.assert(new Message("hello"));
session.assert(new Message("hello world"));
session.assert(new Message("goodbye"));
```

As a convenience any object passed into **getSession** will also be asserted.

**Note** assert is typically used pre engine execution and during the execution of the rules.

```javascript
flow.getSession(new Message("hello"), new Message("hello world"), new Message("goodbye"));
```


## Retract

To remove facts from the session use the `retract` method.

```javascript
var m = new Message("hello");

//assert the fact into the engine
session.assert(m);

//remove the fact from the engine
session.retract(m);

```

**Note** `retract` is typically used during the execution of the rules.


## Modify

To modify a fact use the `modify` method.

**Note** modify will not work with immutable objects (i.e. strings).

```javascript

var m = new Message("hello");

session.assert(m);

m.text = "hello goodbye";

session.modify(m);

```

**Note** `modify` is typically used during the execution of the rules.


## Retrieving Facts

To get a list of facts currently in the session you can use the `getFacts()` method exposed on a session.

```javascript
session.assert(1);
session.assert("A");
session.assert("B");
session.assert(2);

session.getFacts(); //[1, "A", "B", 2];
```

You may also pass in a `Type` to `getFacts` which will return facts only of the given type.

```javascript
session.assert(1);
session.assert("A");
session.assert("B");
session.assert(2);

session.getFacts(Number); //[1, 2];
session.getFacts(String); //["A", "B"];
```

