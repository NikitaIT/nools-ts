---
id: rule-structure
title: Rule structure
---


Lets look at the "Calculate" rule in the [Fibonacci](#fib) example

```javascript
   //flow.rule(type[String|Function], constraints[Array|Array[[]]], action[Function]);
   flow.rule("Calculate", [
         //Type     alias  pattern           store sequence to s1
        [Fibonacci, "f1",  "f1.value != -1", {sequence:"s1"}],
        [Fibonacci, "f2", "f2.value != -1 && f2.sequence == s1 + 1", {sequence:"s2"}],
        [Fibonacci, "f3", "f3.value == -1 && f3.sequence == s2 + 1"],
        [Result, "r"]
    ], function (facts) {
        var f3 = facts.f3, f1 = facts.f1, f2 = facts.f2;
        var v = f3.value = f1.value + facts.f2.value;
        facts.r.result = v;
        this.modify(f3);
        this.retract(f1);
    });
```

Or using the nools DSL

```
rule Calculate{
    when {
        f1 : Fibonacci f1.value != -1 {sequence:s1};
        f2 : Fibonacci f2.value != -1 && f2.sequence == s1 + 1 {sequence:s2};
        f3 : Fibonacci f3.value == -1 && f3.sequence == s2 + 1;
    }
    then {
       modify(f3, function(){
            this.value = f1.value + f2.value;
       });
       retract(f1);
    }
}
```


## Salience

Salience is an option that can be specified on a rule giving it a priority and allowing the developer some control over conflict resolution of activations.

```javascript
this.rule("Hello4", {salience: 7}, [Message, "m", "m.name == 'Hello'"], function (facts) {
});

this.rule("Hello3", {salience: 8}, [Message, "m", "m.name == 'Hello'"], function (facts) {
});

this.rule("Hello2", {salience: 9}, [Message, "m", "m.name == 'Hello'"], function (facts) {
});

this.rule("Hello1", {salience: 10}, [Message, "m", "m.name == 'Hello'"], function (facts) {
});
```

Or using the DSL

```javascript
rule Hello4 {
    salience: 7;
    when {
        m: Message m.name == 'hello';
    }
    then {}
}

rule Hello3 {
    salience: 8;
    when {
        m: Message m.name == 'hello';
    }
    then {}
}

rule Hello2 {
    salience: 9;
    when {
        m: Message m.name == 'hello';
    }
    then {}
}

rule Hello1 {
    salience: 10;
    when {
        m: Message m.name == 'hello';
    }
    then {}
}

```

In the above flow we define four rules each with a different salience, when a single message is asserted they will fire in order of salience (highest to lowest).

```javascript
var fired = [];
flow1
    .getSession(new Message("Hello"))
    .on("fire", function (name) {
        fired.push(name);
    })
    .match()
    .then(function(){
        console.log(fired); //["Hello1", "Hello2", "Hello3", "Hello4"]
    });
```




## Scope

Scope allows you to access function from within your rules.

If you are using vanilla JS you can use the `scope` option when defining your rule.

```javascript

this.rule("hello rule", {scope: {isEqualTo: isEqualTo}},
   [
      ["or",
         [String, "s", "isEqualTo(s, 'hello')"],
         [String, "s", "isEqualTo(s, 'world')"]
      ],
      [Count, "called", null]
   ],
   function (facts) {
      facts.called.called++;
   });


```

If you are using the dsl.

```
function matches(str, regex){
    return regex.test(str);
}

rule Hello {
    when {
        m : Message matches(m.text, /^hello\s*world)?$/);
    }
    then {
        modify(m, function(){
            this.text += " goodbye";
        })
    }
}

rule Goodbye {
    when {
        m : Message matches(m.text, /.*goodbye$/);
    }
    then {
    }
}
```

Or you can pass in a custom function using the scope option in compile.

```
rule Hello {
    when {
        m : Message doesMatch(m.text, /^hello\sworld$/);
    }
    then {
        modify(m, function(){
            this.text += " goodbye";
        })
    }
}

rule Goodbye {
    when {
        m : Message doesMatch(m.text, /.*goodbye$/);
    }
    then {
    }
}
```

Provided the `doesMatch` function in the scope option of compile.

```javascript
function matches(str, regex) {
   return regex.test(str);
};
var flow = nools.compile(__dirname + "/rules/provided-scope.nools", {scope: {doesMatch: matches}});
```


## Constraints

Constraints define what facts the rule should match. The constraint is a array of either a single constraint (i.e. Bootstrap rule) or an array of constraints(i.e. Calculate).

Programmatically

```javascript
[
   //Type     alias  pattern           store sequence to s1
  [Fibonacci, "f1", "f1.value != -1", {sequence:"s1"}],
  [Fibonacci, "f2", "f2.value != -1 && f2.sequence == s1 + 1", {sequence:"s2"}],
  [Fibonacci, "f3", "f3.value == -1 && f3.sequence == s2 + 1"],
  [Result, "r"]
]
```

Using nools DSL

```
when {
    f1 : Fibonacci f1.value != -1 {sequence:s1};
    f2 : Fibonacci f2.value != -1 && f2.sequence == s1 + 1 {sequence:s2};
    f3 : Fibonacci f3.value == -1 && f3.sequence == s2 + 1;
    r  : Result;
}
```

   1. Type -  is the Object type the rule should match. The available types are
      * `String` - "string", "String", String
      * `Number` - "number", "Number", Number
      * `Boolean` - "boolean", "Boolean", Boolean
      * `Date` - "date", "Date", Date
      * `RegExp` - "regexp", "RegExp", RegExp
      * `Array` - "array", "Array", [], Array
      * `Object` - "object", "Object", "hash", Object
      * Custom - any custom type that you define
   2. Alias - the name the object should be represented as.
   3. Pattern(optional) - The pattern that should evaluate to a boolean, the alias that was used should be used to reference the object in the pattern. Strings should be in single quotes, regular expressions are allowed. Any previously defined alias/reference can be used within the pattern. Available operators are.
      * `&&`, `AND`, `and`
      * `||`, `OR`, `or`
      * `>`, `<`, `>=`, `<=`, `gt`, `lt`, `gte`, `lte`
      * `==`, `===`, `!=`, `!==`, `=~`, `!=~`, `eq`, `seq`, `neq`, `sneq`, `like`, `notLike`
      * `+`, `-`, `*`, `/`, `%`
      * `-` (unary minus)
      * `.` (member operator)
      * `in` (check inclusion in an array)
      * `notIn` (check that something is not in an array)
      * Defined helper functions
        * `now` - the current date
        * `Date(year?, month?, day?, hour?, minute?, second?, ms?)` - creates a new `Date` object
        * `lengthOf(arr, length)` - checks the length of an array
        * `isTrue(something)` - check if something === true
        * `isFalse(something)` - check if something === false
        * `isRegExp(something)` - check if something is a `RegExp`
        * `isArray(something)` - check if something is an `Array`
        * `isNumber(something)` - check if something is an `Number`
        * `isHash(something)` - check if something is strictly an `Object`
        * `isObject(something)` - check if something is any type of `Object`
        * `isDate(something)` - check if something is a `Date`
        * `isBoolean(something)` - check if something is a `Boolean`
        * `isString(something)` - check if something is a `String`
        * `isUndefined(something)` - check if something is a `undefined`
        * `isDefined(something)` - check if something is `Defined`
        * `isUndefinedOrNull(something)` - check if something is a `undefined` or `null`
        * `isPromiseLike(something)` - check if something is a "promise" like (containing `then`, `addCallback`, `addErrback`)
        * `isFunction(something)` - check if something is a `Function`
        * `isNull(something)` - check if something is `null`
        * `isNotNull(something)` - check if something is not null
        * `dateCmp(dt1, dt2)` - compares two dates return 1, -1, or 0
        * `(years|months|days|hours|minutes|seconds)(Ago|FromNow)(interval)` - adds/subtracts the date unit from the current time

   4. Reference(optional) - An object where the keys are properties on the current object, and values are aliases to use. The alias may be used in succeeding patterns.



### Custom Constraint

When declaring your rules progrmmatically you can also use a function as a constraint. The function will be called with an object containing each fact that has matched previous constraints.


```javascript
var HelloFact = declare({
    instance: {
        value: true,
        constructor: function (value) {
            this.value = value;
        }
    }
});

var flow = nools.flow("custom contraint", function (flow) {
    flow.rule("hello rule", [HelloFact, "h", function (facts) {
        return facts.h.value === true;
    }], function (facts) {
        console.log(facts.h.value); //always true
    });
});

var session = flow.getSession();
session.assert(new HelloFact(false));
session.assert(new HelloFact(true));
session.match().then(function(){
    console.log("DONE");
});
```


### Not Constraint

The `not` constraint allows you to check that particular `fact` does **not** exist.

```javascript

[
    [Number, "n1"],
    ["not", Number, "n2", "n1 > n2"]
]

```

Or using the DSL.

```

when {
    n1: Number;
    not(n2: Number n1 > n2);
}

```

The previous example will check that for all numbers in the `workingMemory` there is **not** one that is greater than `n1`.


### Or Constraint

The `or` constraint can be used to check for the existence of multiple facts.

```javascript

[
    ["or",
        [String, "s", "s == 'hello'"],
        [String, "s", "s == 'world'"],
        [String, "s", "s == 'hello world'"]
    ]
]

```

Using the DSL.

```
when {
    or(
        s : String s == 'hello',
        s : String s == 'world',
        s : String s == 'hello world'
    );
}
```

The previous example will evaluate to `true` if you have a string in `workingMemory` that equals `hello`, `world, or 'hello world`.

**Or with Not**

The `or` constraint can be combined with a `not` constraint to allow for the checking of multiple not conditions without the implcit and.

```javascript
var flow = nools.flow("or condition with not conditions", function (flow) {
        flow.rule("hello rule", [
                ["or",
                    ["not", Number, "n1", "n1 == 1"],
                    ["not", String, "s1", "s1 == 'hello'"],
                    ["not", Date, "d1", "d1.getDate() == now().getDate()"]
                ],
                [Count, "called", null]
            ], function (facts) {
                facts.called.called++;
            });
        });
});
```
or using the dsl.

```
rule MultiNotOrRule {
    when {
        or (
            not(n1: Number n1 == 1),
            not(s1: String s1 == 'hello'),
            not(d1: Date d1.getDate() == now().getDate())
        );
        c: Count;
    }
    then{
        c.called++;
    }
}
```

**Note** Using the `or` with a `not` will cause the activation to fire for each `not` condition that passes. In the above examples if none of the three facts existed then the rule would fire three times.


### From Constraint

The `from` modifier allows for the checking of facts that are not necessarily in the `workingMemory`.

The `from` modifier can be used to access properties on a `fact` in `workingMemory` or you can use javascript expressions.

To access properties on a fact you can use the fact name and the property you wish to use as the source for the `from` source.

```javascript
[
    [Person, "p"],
    [Address, "a", "a.zipcode == 88847", "from p.address"],
    [String, "first", "first == 'bob'", "from p.firstName"],
    [String, "last", "last == 'yukon'", "from p.lastName"]
]
```

Or using the DSL.

```
when {
    p: Person:
    a: Address a.zipcode == 88847 from p.address;
    first: String first == 'bob' from p.firstName;
    last: String last == 'yukon' from p.lastName;
}
```

The above example will used the address, firstName and lastName from the `person` fact.

You can also use the `from` modifier to check facts that create a graph.

For example assume the person object from above has friends that are also of type `Person`.

```javascript
[
    [Person, "p"],
    [Person, "friend", "friend.firstName != p.firstName", "from p.friends"],
    [String, "first", "first =~ /^a/", "from friend.firstName"]
]
```

Or using the DSL.

```
when {
    p: Person;
    friend: Person friend.firstName != p.firstName from p.friends;
    first: String first =~ /^a/ from friend.firstName;
}
```

The above example will pull the `friend` fact from the friends array property on fact `p`, and first from the `friend`'s `firstName`.

You could achieve the same thing using the following code if you assert all friends into working memory.

```
when {
    p: Person;
    friend: Person friend in p.friends && friend.firstName != p.firstName && p.firstName =~ /^a/;
}
```


To specify the from source as an expression you can do the following.

```javascript
[
    [Number, "n1", "from [1,2,3,4,5]"]
]
```

Or using the dsl

```
{
    n1: Number from [1,2,3,4,5];
}
```

Using the above syntax you could use `from` to bootstrap data.

You can also use any function defined in the scope of the `rule` or `flow`

```javascript

flow.rule("my rule", {
    scope: {
        myArr: function(){
            return [1,2,3,4,5];
        }
    },
    [Number, "n1", "from myArr()"],
    function(facts){
        this.assert(facts.n1);
    }
}

```

Or using the dsl and the [scope](#rule-scope) option.

```
rule "my rule", {
    when {
        n1: Number from myArr();
    }
    then{
        assert(n1);
    }
}
```



### Exists Constraint

`exists` is the logical inversion of a `not` constraint. It checks for the existence of a fact in memory.

 **NOTE** If there are multiple facts that satisfy the constraint the rule will **ONLY** be fired once.

 ```javascript

 [
     ["exists", Number, "n1", "n1 > 1"]
 ]

 ```

 Or using the DSL.

 ```

 when {
     exists(n1: Number n1 > 1);
 }

 ```

 Assuming the above constraint. The following facts would cause the rule to fire once since there is a number that is greater than 1.

 ```javascript
 session.assert(1);
 session.assert(2);
 session.assert(3);
 session.assert(4);
 session.assert(5);
 ```



## Action

The action is a function that should be fired when all patterns in the rule match. The action is called in the scope
of the engine so you can use `this` to `assert`, `modify`, or `retract` facts. An object containing all facts and
references created by the alpha nodes is passed in as the first argument to the action.

So calculate's action modifies f3 by adding the value of f1 and f2 together and modifies f3 and retracts f1.

```javascript
function (facts) {
        var f3 = facts.f3, f1 = facts.f1, f2 = facts.f2;
        var v = f3.value = f1.value + facts.f2.value;
        facts.r.result = v;
        this.modify(f3);
        this.retract(f1);
    }
```

The session is also passed in as a second argument so alternatively you could do the following.

```javascript
function (facts, session) {
        var f3 = facts.f3, f1 = facts.f1, f2 = facts.f2;
        var v = f3.value = f1.value + facts.f2.value;
        facts.r.result = v;
        session.modify(f3);
        session.retract(f1);
    }
```

To define the actions with the nools DSL

```
then {
    modify(f3, function(){
        this.value = f1.value + f2.value;
    });
    retract(f1);
}
```

For rules defined using the rules language nools will automatically determine what parameters need to be passed in based on what is referenced in the action.




## Async Actions

If your action is async you can use the third argument which should be called when the action is completed.

```javascript
function (facts, engine, next) {
        //some async action
        process.nextTick(function(){
            var f3 = facts.f3, f1 = facts.f1, f2 = facts.f2;
            var v = f3.value = f1.value + facts.f2.value;
            facts.r.result = v;
            engine.modify(f3);
            engine.retract(f1);
            next();
        });
    }
```

If an error occurs you can pass the error as the first argument to `next`.

```javascript
then{
   saveToDatabase(user, function(err){
      next(new Error("Something went BOOM!"));
   });
}
```

If you are using a [`Promises/A+`](http://promises-aplus.github.io/promises-spec/) compliant library you can just return a promise from your action and `nools` will wait for the promise to resolve before continuing.

```javascript
then{
   return saveToDatabase(user); // assume saveToDatabase returns a promise
}
```



## Globals

Globals are accessible through the current working scope of rules defined in a `dsl`, very similar to using the `scope` option when compiling.

**Note**  `globals` are not part of the working memory and therefore are not accessible in the LHS (when) or your rule.

Globals are used like the following:

```
global PI = Math.PI;
global SOME_STRING = 'some string';
global TRUE = true;
global NUM = 1.23;
global DATE = new Date();

rule "A Rule" {
    when {
    	$obj: Object;
    }
    then{
    	console.log(PI); //Math.PI;
    	console.log(SOME_STRING); //"some string"
    	console.log(TRUE); //true
    	console.log(NUM); //1.23
    	console.log(DATE); //Thu May 23 2013 15:49:22 GMT-0500 (CDT)
    }
}
```

If you are using `nools` in `node` you can also use a require statement.

**NOTE** require does not currently work for relative paths.

```
global util = require("util");

rule "A Rule" {
    when {
    	$obj: Object;
    }
    then{
    	util.log("HELLO WORLD");
    }
}
```



## Importing

The `import` statement allows you to import other `nools` files into the current one. This can be used to split up logical flows into small reusable groups of rules.

Define our common model to be used across our flows.

```
//define.nools
define Count{
    constructor: function(){
        this.called = 0;
    }
}
```

Create a rules file which imports the `define.nools` to define our `Count` model.

```
//orRule.nools

//import define.nools
import("./define.nools");
rule orRule {
    when {
        or(
            s : String s == 'hello',
            s : String s == 'world'
        );
        count : Count;
    }
    then {
        count.called++;
        count.s = s;
    }
}
```

Same as `orRule.nools` import our `define.nools`

```
//notRule.nools
import("./defines.nools");
rule notRule {
    when {
        not(s : String s == 'hello');
        count : Count
    }
    then {
        count.called++;
    }
}
```

Now we can use `orRule.nools` and `notRule.nools` to compose a new flow that contains `define.nools`, `orRule.nools` and `notRule.nools`.


**Note** `nools` will handle duplicate imports, in this case `define.nools` will only be imported once.

```
//import
import("./orRules.nools");
import("./notRules.nools");
```

