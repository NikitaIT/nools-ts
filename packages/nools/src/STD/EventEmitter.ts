const defaultMaxListeners = 10;
export type SpecialEvents = "error" | "newListener";
type Events<TEvents extends keyof any> = {
  [type in TEvents]: Function[];
};
// Should be:
// & {
//   warned?: boolean;
// }
export class EventEmitter<TEvents extends keyof any = string> {
  constructor(
    private maxListeners = defaultMaxListeners,
    private _events: Partial<Events<TEvents | SpecialEvents>> = {}
  ) {}

  setMaxListeners(n: number) {
    this.maxListeners = n;
  }

  on(type: TEvents | SpecialEvents, listener: Function) {
    return this.addListener(type, listener);
  }

  addListener(type: TEvents | SpecialEvents, listener: Function) {
    if ("function" !== typeof listener) {
      throw new Error("addListener only takes instances of Function");
    }

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit("newListener", type, listener);

    const listeners = this._events[type];
    if (!listeners) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = [listener];
    } else {
      // todo: report about error in ts compiler
      // @ts-ignore shuld be not null
      this.checkForListenerLeak(listeners);
      listeners.push(listener);
    }

    return this;
  }

  private checkForListenerLeak(listeners: Function[]) {
    if (!(listeners as any).warned) {
      const m = this.maxListeners;

      if (m && m > 0 && listeners.length > m) {
        (listeners as any).warned = true;
        console.error(
          "(node) warning: possible EventEmitter memory " +
            "leak detected. %d listeners added. " +
            "Use emitter.setMaxListeners() to increase limit.",
          listeners.length
        );
        console.trace();
      }
    }
  }

  emit(type: TEvents | SpecialEvents, ...args: any[]) {
    // If there is no 'error' event listener then throw.
    if (type === "error") {
      if (!this._events[type]) {
        if (args[0] instanceof Error) {
          throw args[0]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
      }
    }

    const handlers = this._events[type];
    if (!handlers) {
      return false;
    }

    if (handlers) {
      handlers.forEach((listener) => {
        listener(...args);
      });
      return true;
    } else {
      return false;
    }
  }

  once(type: TEvents | SpecialEvents, listener: Function) {
    const self = this;
    this.on(type, function g(...args: any[]) {
      self.removeListener(type, g);
      listener(...args);
    });

    return this;
  }

  removeListener(type: TEvents | SpecialEvents, listener: Function) {
    if ("function" !== typeof listener) {
      throw new Error("removeListener only takes instances of Function");
    }

    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events[type]) {
      return this;
    }

    const list = this._events[type];

    if (list) {
      const i = list.indexOf(listener);
      if (i < 0) return this;
      list.splice(i, 1);
      if (list.length == 0) {
        delete this._events[type];
      }
    }

    return this;
  }

  removeAllListeners(type?: TEvents | SpecialEvents) {
    if (type === undefined) {
      this._events = {};
      return this;
    }

    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events[type]) {
      delete this._events[type];
      // todo: check if it needed
      // this._events[type] = null;
    }
    return this;
  }

  listeners(type: TEvents | SpecialEvents) {
    return this._events[type] || [];
  }

  listenerCount<TEvents extends keyof any>(
    emitter: EventEmitter<TEvents>,
    type: TEvents | SpecialEvents
  ) {
    const fns = emitter._events[type];
    return fns ? fns.length : 0;
  }
}

// const EE: typeof EventEmitter = typeof process !== "undefined" ? require('events').EventEmitter : EventEmitter;
// export  EE;
