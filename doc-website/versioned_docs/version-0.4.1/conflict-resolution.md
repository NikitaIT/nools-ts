---
id: conflict-resolution
title: Conflict Resolution
---

When declaring a flow it is defined with a default conflict resolution strategy. A conflict resolution strategy is used to determine which rule to activate when multiple rules are ready to be activated at the same time.

## Resolution Strategies

* `salience` - sort activations on the specified [`salience`](#rule-salience). (**NOTE** The default salience of a rule is 0).
* `activationRecency` - sort activations on activation recency. This is a `LIFO` strategy the latest activation takes precedence.
* `factRecency` - sort activations based on `fact` recency. Each time a fact is `asserted` or `modified` its recency is incremented.
* `bucketCounter` - sort activations on the internal `bucket` counter. The bucket counter is incremented after an activation is fired and the internal `workingMemory` is altered.
* `factRecencyInverse` - sort activations by the oldest fact first. This is a `FIFO` strategy, the earliest fact takes precedence.

The default conflict resolution strategy consists of `salience` and `activationRecency`.

## Examples

**Example 1**

```
//activation 1
{
    salience: 0,
    activationRecency: 1
}

//activation 2
{
    salience: 0,
    activationRecency: 2
}

```

In the above example activation 2 would be fired since it is the most recent activation and the rule salience is the same.

**Example 2**

```
//activation 1
{
    salience: 1,
    activationRecency: 1
}

//activation 2
{
    salience: 0,
    activationRecency: 2
}

```
In this example activation 1 would fire because it has a greater salience

## Overidding The Default Strategy

To override the default strategy you can use the `conflictResolution` method on a flow.

```javascript

var flow = nools.flow(/**define your flow**/);

flow.conflictResolution(["salience", "factRecency", "activationRecency"]);

```

The combination of `salience`, `factRecency`, and `activationRecency` would do the following.

1. Check if the salience is the same, if not use the activation with the greatest salience.
2. If salience is the same check if fact recency is the same. The fact recency is determined by looping through the facts in each activation and until two different recencies are found. The activation with the greatest recency takes precendence.
3. If fact recency is the same check the activation recency.


**Example 1**

```
//activation 1
{
    salience: 2,
    factRecency: [1,2,3],
    activationRecency: 1
}

//activation 2
{
    salience: 1,
    factRecency: [1,2,4],
    activationRecency: 2
}
```

In this example activation 1 would fire because it's salience is the greatest.

**Example 2**

```
//activation 1
{
    salience: 1,
    factRecency: [1,2,3],
    activationRecency: 1
}

//activation 2
{
    salience: 1,
    factRecency: [1,2,4],
    activationRecency: 2
}
```

In Example 2 activation 2 would fire because of the third recency entry.

**Example 3**

```
//activation 1
{
    salience: 2,
    factRecency: [1,2,3],
    activationRecency: 1
}

//activation 2
{
    salience: 1,
    factRecency: [1,2,3],
    activationRecency: 2
}
```

In Example 3 activation 2 would fire because `salience` and `factRecency` are the same but activation 2's activation recency is greater.

