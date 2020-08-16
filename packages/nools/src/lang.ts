import { isMap, isObject, isWeakMap } from "@nools/lodash-port";

function plucked<T>(prop: string) {
  const exec = prop.match(/(\w+)\(\)$/);
  if (exec) {
    prop = exec[1];
    return function (item: Record<string, () => T>) {
      return item[prop]();
    };
  } else {
    return function (item: Record<string, T> | Map<string, T>) {
      return isMap(item) || isWeakMap(item) ? item.get(prop) : item[prop];
    };
  }
}

export function plucker<K, T extends Record<string, () => K>>(prop: string) {
  const props = prop.split(".");
  if (props.length === 1) {
    return plucked(props[0]);
  } else {
    const pluckers = props.map((prop) => {
      return plucked(prop);
    });
    const l = pluckers.length;
    return function (item: T) {
      let i = -1,
        res = item;
      while (++i < l) {
        res = pluckers[i](res);
      }
      return res;
    };
  }
}

export function removeDups<T>(arr: T[]) {
  return arr.filter((it, idx) => {
    return arr.indexOf(it, ++idx) == -1;
  });
}

export function to_map(m: any) {
  if (isMap(m)) {
    return m as Map<string, any>;
  } else if (isObject(m)) {
    const map = new Map<string, any>();
    for (const n in m) {
      if (m.hasOwnProperty(n)) {
        map.set(n, m[n]);
        (map as any)[n] = m[n];
      }
    }
    return map;
  } else {
    return new Map<string, any>();
  }
}
