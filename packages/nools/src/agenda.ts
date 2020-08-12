import { ITerminalNode } from "./runtime/nodes/types";
import { EventEmitter } from "./STD";
import { IInsert } from "./interfaces";
import { Flow } from "./flow";
import { AVLTree } from "@nools/data-structures";
import { Context } from "./context";
import { Tagged } from "./Tagged";

interface IFactHash extends Map<string, IInsert | Context> {}

interface IAgendaRule {
  [name: string]: {
    tree: AVLTree<IInsert>;
    factTable: IFactHash;
  };
}

function fh_create(): IFactHash {
  return new Map<string, IInsert | Context>();
}

function fh_remove(fh: IFactHash, v: Context | IInsert) {
  const hashCode = v.hashCode;
  const memory = fh;
  const ret = memory.get(hashCode);
  if (ret) {
    memory.delete(hashCode);
  }
  return ret;
}

function fh_insert(fh: IFactHash, insert: IInsert) {
  const hashCode = insert.hashCode;
  const memory = fh;
  if (memory.has(hashCode)) {
    throw new Error(
      "Activation already in agenda " + insert.rule.n + " agenda"
    );
  }
  memory.set(hashCode, insert);
}

export type AgendaGroupTag = Tagged<string, "AgendaGroupTag">;
export type AgendaGroupTagDefault = Tagged<"main", "AgendaGroupTag">;

const DEFAULT_AGENDA_GROUP = "main" as AgendaGroupTagDefault;

export const enum AgendaGroupEvent {
  focused = "focused",
  fire = "fire",
}

class AgendaGroupStack {
  private stack: Array<AgendaGroupTag> = [DEFAULT_AGENDA_GROUP];
  constructor() {}
  push(agendaGroup: AgendaGroupTag) {
    this.stack.push(agendaGroup);
  }
  pop(): AgendaGroupTag | undefined {
    return this.stack.pop();
  }
  head(): AgendaGroupTag | AgendaGroupTagDefault {
    const ags = this.stack;
    return ags[ags.length - 1];
  }
}
export class AgendaTree extends EventEmitter<AgendaGroupEvent> {
  private agendaGroupStack = new AgendaGroupStack();
  private agendaGroups = new Map<AgendaGroupTag, AVLTree<IInsert>>();
  private ruleByName = {} as IAgendaRule;
  constructor(
    private readonly flow: Flow,
    private readonly comparator: (a: IInsert, b: IInsert) => number
  ) {
    super();
    this.setFocus(DEFAULT_AGENDA_GROUP).addAgendaGroup(DEFAULT_AGENDA_GROUP);
  }

  /**
   * Idempotent
   */
  addAgendaGroup(groupName: AgendaGroupTag) {
    if (!this.agendaGroups.has(groupName)) {
      this.agendaGroups.set(groupName, new AVLTree(this.comparator));
    }
  }

  getAgendaGroup(groupName: null | undefined): AVLTree<IInsert>;
  getAgendaGroup(
    groupName: AgendaGroupTag | null | undefined
  ): AVLTree<IInsert> | undefined;
  getAgendaGroup(
    groupName: AgendaGroupTag | null | undefined
  ): AVLTree<IInsert> | undefined {
    return this.agendaGroups.get(groupName || DEFAULT_AGENDA_GROUP);
  }

  setFocus(agendaGroup: AgendaGroupTag) {
    if (agendaGroup !== this.focused && this.agendaGroups.has(agendaGroup)) {
      this.agendaGroupStack.push(agendaGroup);
      this.emit(AgendaGroupEvent.focused, agendaGroup);
    }
    return this;
  }

  /**
   * @return last added group
   */
  get focused() {
    return this.agendaGroupStack.head();
  }

  get focusedAgenda() {
    const x = this.agendaGroups.get(this.focused);
    if (!x) {
      throw Error(
        `Agenda should be always focused, couse focus on "${DEFAULT_AGENDA_GROUP}" by default`
      );
    }
    return x;
  }

  register(node: ITerminalNode) {
    const agendaGroup = node.r.g;
    this.ruleByName[node.n] = {
      tree: new AVLTree(this.comparator),
      factTable: fh_create(),
    };
    if (agendaGroup) {
      this.addAgendaGroup(agendaGroup);
    }
    return node;
  }
  private isFocusOnNotDefaultEmptyAgenda() {
    return (
      this.focusedAgenda.isEmpty() && this.focused !== DEFAULT_AGENDA_GROUP
    );
  }
  isEmpty() {
    const agendaGroupStack = this.agendaGroupStack;
    let changed = false;
    while (this.isFocusOnNotDefaultEmptyAgenda()) {
      agendaGroupStack.pop();
      changed = true;
    }
    if (changed) {
      this.emit(AgendaGroupEvent.focused, this.focused);
    }
    return this.focusedAgenda.isEmpty();
  }

  fireNext(): Promise<any> {
    const agendaGroupStack = this.agendaGroupStack;
    while (this.isFocusOnNotDefaultEmptyAgenda()) {
      agendaGroupStack.pop();
    }
    if (!this.focusedAgenda.isEmpty()) {
      const activation = this.pop();
      this.emit(
        AgendaGroupEvent.fire,
        activation.rule.n,
        activation.match.factHash
      );
      return activation.rule.fire(this.flow, activation.match);
    } else {
      //return false if activation not fired
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  pop() {
    const tree = this.focusedAgenda;
    const v = this.peek();
    tree.remove(v);
    const rule = this.ruleByName[v.name];
    rule.tree.remove(v);
    fh_remove(rule.factTable, v);
    return v;
  }

  peek() {
    const tree = this.focusedAgenda;
    let root = tree.root;
    if (!root) {
      throw new Error("tree.root not exists");
    }
    while (root.right) {
      root = root.right;
    }
    return root.data;
  }

  modify(node: ITerminalNode, context: IInsert) {
    this.retract(node, context);
    this.insert(node, context);
  }

  retract(node: ITerminalNode, retract: Context | IInsert) {
    const rule = this.ruleByName[node.n];
    retract.rule = node;
    const activation = fh_remove(rule.factTable, retract);
    if (activation) {
      this.getAgendaGroup(node.r.g)!.remove(activation as IInsert);
      rule.tree.remove(activation as IInsert);
    }
  }

  insert(node: ITerminalNode, insert: IInsert) {
    const rule = this.ruleByName[node.n],
      nodeRule = node.r,
      agendaGroup = nodeRule.g;
    rule.tree.insert(insert);
    this.getAgendaGroup(agendaGroup)!.insert(insert);
    if (nodeRule.af) {
      this.setFocus(agendaGroup!);
    }

    fh_insert(rule.factTable, insert);
  }

  dispose() {
    for (const [name, agenda] of this.agendaGroups) {
      agenda.clear();
    }
    const ruleByName = this.ruleByName;
    for (const i in ruleByName) {
      ruleByName[i].tree.clear();
      ruleByName[i].factTable = fh_create();
    }
    this.ruleByName = {};
  }
}
