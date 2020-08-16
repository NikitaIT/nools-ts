import { Fact } from "./facts/fact";
import { IInsert } from "./interfaces";
import { IBucketed, IRootNode } from "./runtime/nodes/INode";
import { LinkedList, EventEmitter } from "./STD";
import { FactObject, WorkingMemory } from "./WorkingMemory";
import { AgendaGroupEvent, AgendaGroupTag, AgendaTree } from "./agenda";

import { RootNode } from "./nodes/root-node";
import { ExecutionStragegy } from "./execution-strategy";
import { build } from "./runtime/nodes";
export const enum FlowEvent {
  modify = "modify",
  retract = "retract",
  assert = "assert",
}
export class Flow extends EventEmitter<AgendaGroupEvent | FlowEvent> {
  // conflictResolutionStrategy: (a, b) => number;
  private workingMemory = new WorkingMemory(new LinkedList<Fact>(), 0);
  public agenda: AgendaTree;
  public data: IRootNode & IBucketed;
  private executionStrategy: ExecutionStragegy | null = null;
  private rootNode = new RootNode();
  constructor(
    data: IRootNode,
    conflictResolutionStrategy: (a: IInsert, b: IInsert) => number,
    defined: Map<string, any>,
    scope: Map<string, any>,
  ) {
    super();
    this.agenda = new AgendaTree(this, conflictResolutionStrategy);
    this.agenda.on(AgendaGroupEvent.fire, (...args: any[]) => {
      this.emit(AgendaGroupEvent.fire, ...args);
    });
    this.agenda.on(AgendaGroupEvent.focused, (...args: any[]) => {
      this.emit(AgendaGroupEvent.focused, ...args);
    });
    this.data = build(data, this.agenda, defined, scope);
  }

  getFacts<TType extends new (...args: any) => any>(Type?: TType): Array<InstanceType<TType>> {
    return Type ? this.workingMemory.getFactsByType(Type) : this.workingMemory.getFacts();
  }

  getFact<TType extends new (...args: any) => any>(Type: TType): InstanceType<TType> {
    const ret = this.getFacts(Type);
    return ret && ret[0];
  }

  focus(focused: AgendaGroupTag) {
    this.agenda.setFocus(focused);
    return this;
  }

  halt() {
    if (!this.executionStrategy) {
      throw new Error("call flow.matchUntilHalt or flow.match before halt");
    }
    this.executionStrategy.halt();
    return this;
  }

  dispose() {
    this.workingMemory.dispose();
    this.agenda.dispose();
    this.rootNode.dispose(this.data);
  }

  assert<TObject extends FactObject>(fact: TObject) {
    this.rootNode.assertFact(this.data, this.workingMemory.assertFact(fact), this.workingMemory);
    this.emit(FlowEvent.assert, fact);
    return fact;
  }

  // This method is called to remove an existing fact from working memory
  retract<TObject extends FactObject>(fact: TObject) {
    //fact = this.workingMemory.getFact(fact);
    this.rootNode.retractFact(this.data, this.workingMemory.retractFact(fact), this.workingMemory);
    this.emit(FlowEvent.retract, fact);
    return fact;
  }

  // This method is called to alter an existing fact.  It is essentially a
  // retract followed by an assert.
  modify(fact: any) {
    //fact = this.workingMemory.getFact(fact);
    this.rootNode.modifyFact(this.data, this.workingMemory.modifyFact(fact), this.workingMemory);
    this.emit(FlowEvent.modify, fact);
    return fact;
  }

  containsRule(name: string) {
    return this.rootNode.containsRule(this.data, name);
  }

  matchUntilHalt() {
    this.executionStrategy = new ExecutionStragegy(this, true);
    return this.executionStrategy.execute();
  }

  match() {
    this.executionStrategy = new ExecutionStragegy(this);
    return this.executionStrategy.execute();
  }
}
