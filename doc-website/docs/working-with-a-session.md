---
id: working-with-a-session
title: Working with a session
---

A session is an instance of the flow that contains a working memory and handles the assertion, modification, and retraction of facts from the engine.

To obtain an engine session from the flow invoke the  `getSession` method.

```javascript
var session = flow.getSession();
```

## Firing the rules

When you get a session from a **flow** no rules will be fired until the **match** method is called.

```javascript
var session = flow.getSession();
//assert your different messages
session.assert(new Message("goodbye"));
session.assert(new Message("hello"));
session.assert(new Message("hello world"));

//now fire the rules
session.match(function(err){
    if(err){
        console.error(err.stack);
    }else{
        console.log("done");
    }
})
```

The **match** method also returns a promise that is resolved once there are no more rules to activate.

```javascript
session.match().then(
  function(){
      console.log("Done");
  },
  function(err){
    //uh oh an error occurred
    console.error(err.stack);
  });
```

## Fire until halt

You may also run the engine an a "reactive" mode which will continue to match until `halt` is invoked.

In the following example the rules engine continues to evaluate until the counter reaches `10000`. If you remove the "counted to high" rule then the engine would run indefinitely.

```javascript

define Counter {
    count: 0,
    constructor: function(count){
        this.count = count;
    }
}

//We reached our goal
rule "I can count!" {
    when {
        $ctr: Counter $ctr.count == 10000;
    }
    then{
        console.log("Look ma! I counted to " + $ctr.count);
        halt();
    }
}

//no counter was asserted so create one
rule "not count" {
    when {
        not($ctr: Counter);
    }
    then{
        console.log("Imma gonna count!");
        assert(new Counter(1));
    }
}

//A little status update
rule "give them an update" {
    when{
        $ctr: Counter $ctr.count % 1000 == 0 {count: $count}
    }
    then{
        console.log("Imma countin...");
        modify($ctr, function(){this.count = $count + 1;});
    }
}

//just counting away
rule count {
    when{
        $ctr: Counter {count: $count}
    }
    then{
        modify($ctr, function(){
          this.count = $count + 1;
        });
    }
}

```

```javascript
flow.getSession().matchUntilHalt(function(err){
    if(err){
        console.log(err.stack);
        return;
    }
    //halt finally invoked
});
```

`matchUntilHalt` also returns a promise.


```javascript
flow.getSession().matchUntilHalt()
    .then(
        function(){
            //all done!
        },
        function(err){
            console.log(err.stack);
        }
    );
```


