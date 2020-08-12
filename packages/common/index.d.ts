export interface ICondition extends Array<any> {
  scope?: Map<string, any>;
  [0]: string | ICondition;
  [1]: string | ICondition;
  [2]: string;
  [3]?: any;
  [4]?: {
    from: string;
  } | null;
}

export interface IScopedCondition {
  scope: Map<string, any>;
  [0]: string | (ICondition & IScopedCondition);
  [1]: string | (ICondition & IScopedCondition);
}
