import _isNumber from "lodash-ts/isNumber";
import _isEmpty from "lodash-ts/isEmpty";
import _isString from "lodash-ts/isString";
import _isHash from "lodash-ts/isHash";
import _isFunction from "lodash-ts/isFunction";
import _isEqual from "lodash-ts/isEqual";
import _flattenDeep from "lodash-ts/flattenDeep";
import _mixin from "lodash-ts/mixin";
import _clone from "lodash-ts/clone";
import _isBoolean from "lodash-ts/isBoolean";
import _isArray from "lodash-ts/isArray";
import _keys from "lodash-ts/keys";
import _isObject from "lodash-ts/isObject";
import _isMap from "lodash-ts/isMap";
import _intersection from "lodash-ts/intersection";
import _isWeakMap from "lodash-ts/isWeakMap";
/*
  todo: REPLACE THIS. @nools/lodash-port
  USE: javascript
*/
export const isArray = _isArray;
export const keys = _keys;
export function isObject(value: any): value is Record<any, any> {
  return _isObject(value);
}
export function isWeakMap(value: any): value is WeakMap<any, any> {
  return _isWeakMap(value);
}
export function isMap(value: any): value is Map<any, any> {
  return _isMap(value);
}
export const intersection = _intersection;

export function isBoolean(value: any): value is boolean {
  return _isBoolean(value);
}

export function isNumber(value: any): value is number {
  return _isNumber(value);
}

export function isEmpty(value: any): boolean {
  return _isEmpty(value);
}

export function isString(value: any): value is string {
  return _isString(value);
}

export function isFunction<T extends (...args: any[]) => any>(value: any): value is T {
  return _isFunction(value);
}

export function isHash(value: any): boolean {
  return _isHash(value);
}

export function isEqual(value: any, other: any): boolean {
  return _isEqual(value, other);
}
export function flattenDeep(value: any[]): any[] {
  return _flattenDeep(value);
}
export const mixin = _mixin;
export const clone = _clone;
