---
id: disposing
title: Disposing
---

## Disposing of the session

When working with a lot of facts it is wise to call the `dispose` method which will purge the current session of
all facts, this will help prevent the process from growing a large memory footprint.

```javascript
session.dispose();
```


## Removing a flow

To remove a defined flow from `nools` use the `deleteFlow` function.

```javascript
var myFlow = nools.flow("flow");

nools.deleteFlow("flow"); //returns nools for chaining

nools.getFlow("flow"); //undefined

```

You may also remove a flow using the `FlowContainer` object returned from nools.flow;

```javascript
var myFlow = nools.flow("flow");

nools.deleteFlow(myFlow); //returns nools for chaining

nools.getFlow("flow"); //undefined
```


## Removing All Flows

To remove all flow from `nools` use the `deleteFlows` function.

```javascript
var myFlow = nools.flow("flow");

nools.deleteFlows(); //returns nools for chaining

nools.getFlow("flow"); //undefined

```
