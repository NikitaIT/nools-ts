---
id: examples
title: Examples
---


## Fibonacci

```javascript
"use strict";

var nools = require("nools");

var Fibonacci = function (sequence, value) {
    this.sequence = sequence;
    this.value = value || -1;
};

var Result = function (result) {
    this.result = result || -1;
};


var flow = nools.flow("Fibonacci Flow", function (flow) {

    flow.rule("Recurse", [
        ["not", Fibonacci, "f", "f.sequence == 1"],
        [Fibonacci, "f1", "f1.sequence != 1"]
    ], function (facts) {
        var f2 = new Fibonacci(facts.f1.sequence - 1);
        this.assert(f2);
    });

    flow.rule("Bootstrap", [
          Fibonacci, "f", "f.value == -1 && (f.sequence == 1 || f.sequence == 2)"
    ], function (facts) {
        var f = facts.f;
        f.value = 1;
        this.modify(f);
    });

    flow.rule("Calculate", [
        [Fibonacci, "f1", "f1.value != -1", {sequence:"s1"}],
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
});

var r1 = new Result(),
    session1 = flow.getSession(new Fibonacci(10), r1),
    s1 = new Date;
session1.match().then(function () {
    console.log("%d [%dms]", r1.result, new Date - s1);
    session1.dispose();
});

var r2 = new Result(),
    session2 = flow.getSession(new Fibonacci(150), r2),
    s2 = new Date;
session2.match().then(function () {
    console.log("%d [%dms]", r2.result, new Date - s2);
    session2.dispose();
});

var r3 = new Result(),
    session3 = flow.getSession(new Fibonacci(1000), r3),
    s3 = new Date;
session3.match().then(function () {
    console.log("%d [%dms]", r3.result, new Date - s3);
    session3.dispose();
});

```

Output

```
55 [43ms]
9.969216677189305e+30 [383ms]
4.346655768693743e+208 [3580ms]
```

## Fibonacci with nools DSL

```
//Define our object classes, you can
//also declare these outside of the nools
//file by passing them into the compile method
define Fibonacci {
    value:-1,
    sequence:null
}
define Result {
    value : -1
}

rule Recurse {
    when {
        //you can use not or or methods in here
        not(f : Fibonacci f.sequence == 1);
        //f1 is how you can reference the fact else where
        f1 : Fibonacci f1.sequence != 1;
    }
    then {
        assert(new Fibonacci({sequence : f1.sequence - 1}));
    }
}

rule Bootstrap {
   when {
       f : Fibonacci f.value == -1 && (f.sequence == 1 || f.sequence == 2);
   }
   then{
       modify(f, function(){
           this.value = 1;
       });
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
        modify(f3, function(){
            this.value = r.result = f1.value + f2.value;
        });
        retract(f1);
    }
}

```

And to run

```javascript
var flow = nools.compile(__dirname + "/fibonacci.nools");

var Fibonacci = flow.getDefined("fibonacci"), Result = flow.getDefined("result");
var r1 = new Result(),
    session1 = flow.getSession(new Fibonacci({sequence:10}), r1),
    s1 = +(new Date());
session1.match().then(function () {
    console.log("%d [%dms]", r1.result, +(new Date()) - s1);
    session1.dispose();
});

var r2 = new Result(),
    session2 = flow.getSession(new Fibonacci({sequence:150}), r2),
    s2 = +(new Date());
session2.match().then(function () {
    console.log("%d [%dms]", r2.result, +(new Date()) - s2);
    session2.dispose();
});

var r3 = new Result(),
    session3 = flow.getSession(new Fibonacci({sequence:1000}), r3),
    s3 = +(new Date());
session3.match().then(function () {
    console.log("%d [%dms]", r3.result, +(new Date()) - s3);
    session3.dispose();
});

```
