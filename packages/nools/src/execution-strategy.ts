import { Flow, FlowEvent } from "./flow";
import { AgendaTree } from "./agenda";
import { IBucketed, IRootNode } from "./runtime/nodes/INode";

export class ExecutionStragegy {
  private looping = false;
  private readonly agenda: AgendaTree = this.flow.agenda;
  private readonly rootNode: IRootNode & IBucketed = this.flow.data;
  private __halted = false;
  private flowAltered = false;
  private readonly onAlter: () => void = () => {
    this.flowAltered = true;
  };
  constructor(private readonly flow: Flow, private readonly matchUntilHalt = false) {}

  halt() {
    this.__halted = true;
    if (!this.looping) {
      this.tearDown();
    }
  }

  private setup() {
    const flow = this.flow;
    this.rootNode.bucket.counter = 0;
    flow.on(FlowEvent.assert, this.onAlter);
    flow.on(FlowEvent.modify, this.onAlter);
    flow.on(FlowEvent.retract, this.onAlter);
  }

  private tearDown() {
    const flow = this.flow;
    flow.removeListener(FlowEvent.assert, this.onAlter);
    flow.removeListener(FlowEvent.modify, this.onAlter);
    flow.removeListener(FlowEvent.retract, this.onAlter);
  }

  private __handleAsyncNext(next: Promise<any>): Promise<any> {
    const agenda = this.agenda;
    return next.then(() => {
      this.looping = false;
      if (!agenda.isEmpty()) {
        if (this.flowAltered) {
          ++this.rootNode.bucket.counter;
          this.flowAltered = false;
        }
        if (!this.__halted) {
          return this.callNext();
        } else {
          return this.tearDown();
        }
      } else if (!this.matchUntilHalt || this.__halted) {
        return this.tearDown();
      } else {
        return new Promise<any>((resolve, reject) => {
          reject("something must be wrong.");
        });
      }
    });
  }

  private callNext() {
    this.looping = true;
    const next = this.agenda.fireNext();
    return this.__handleAsyncNext(next);
  }

  execute() {
    return new Promise((resolve) => {
      this.setup();
      resolve(this.callNext());
    });
  }
}
