---
id: emitting-custom-events
title: Emitting custom events
---

You may also emit events from your rule actions using the sessions emit function.

```
then {
    modify(f3, function(){
        this.value = f1.value + f2.value;
    });
    retract(f1);
    emit("my custom event");
}
```

To listen to the event just use the on method of the session.

```
var session = flow.getSession();

session.on("my custom event", function(){
    //custom event called.
});

```
