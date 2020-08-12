import { Fact } from "./facts/fact";
import { ITerminalNode } from "./runtime/nodes/types";
import { LinkedList } from "./STD";
import { IPattern } from "./pattern";

function createContextHash(paths: IPattern[], hashCode: string) {
  return (
    paths
      .map((path) => {
        return path.id;
      })
      .reduce((previousValue, currentValue) => {
        return `${previousValue}${currentValue}:`;
      }, "") + hashCode
  );
}

function merge<T>(h1: Map<string, T>, h2: Map<string, T>, aliases: string[]) {
  aliases.forEach((alias) => {
    // todo: check '!' in h2.get(alias)!
    h1.set(alias, h2.get(alias)!);
  });
}

function unionRecency(arr: number[], arr1: number[], arr2: number[]) {
  arr.push(...arr1);
  arr2.forEach((val) => {
    if (arr.indexOf(val) === -1) {
      arr.push(val);
    }
  });
}

/**
 * todo: refactor this hell
 */
export class Match {
  isMatch = true;
  hashCode = "";
  factIds: number[] = [];
  factHash = new Map<string, Fact>();
  recency: number[] = [];
  aliases: string[] = [];
  constructor(private readonly facts: Fact[] = []) {
    this.recency = facts.map((x) => x.recency);
    this.factIds = facts.map((x) => x.id);
    this.hashCode = this.factIds.join(":");
  }

  addFact(assertable: Fact) {
    this.facts.push(assertable);
    this.recency.push(assertable.recency);
    this.factIds.push(assertable.id);
    this.hashCode =
      this.hashCode.length === 0
        ? assertable.id + ""
        : this.hashCode + ":" + assertable.id;
    return this;
  }

  merge(mr: Match) {
    const ret = new Match();
    ret.isMatch = mr.isMatch;
    ret.facts.push(...this.facts);
    ret.facts.push(...mr.facts);
    ret.aliases.push(...this.aliases);
    ret.aliases.push(...mr.aliases);
    ret.hashCode = this.hashCode + ":" + mr.hashCode;
    merge(ret.factHash, this.factHash, this.aliases);
    merge(ret.factHash, mr.factHash, mr.aliases);
    unionRecency(ret.recency, this.recency, mr.recency);
    return ret;
  }
}
export interface MatchesContext {
  rightMatches: { [id: string]: Context };
  leftMatches: { [id: string]: Context };
}

export class Context implements Partial<MatchesContext> {
  // todo: remove this shit
  // setMatch ->
  match!: Match;
  factHash!: Map<string, any>;
  aliases!: string[];
  hashCode!: string;
  // <- setMatch
  fact: Fact;
  paths: IPattern[] | null = null;
  pathsHash: string;
  rightMatches?: { [id: string]: Context };
  leftMatches?: { [id: string]: Context };
  blocker?: Context;
  blocking?: LinkedList<Context>;
  fromMatches: { [id: number]: Context } = {};
  blocked = false;
  rule?: ITerminalNode; // TerminalNode assigned when AgendaTree.retract

  constructor(fact: Fact, paths?: IPattern[] | null, mr?: Match | null) {
    this.fact = fact;
    this.setMatch(mr || new Match().addFact(fact));
    if (paths) {
      this.paths = paths;
      this.pathsHash = createContextHash(paths, this.hashCode);
    } else {
      this.pathsHash = this.hashCode;
    }
  }

  set(key: string, value: any) {
    this.factHash.set(key, value);
    this.aliases.push(key);
    return this;
  }

  get isMatch() {
    return this.match.isMatch;
  }

  /**
   * dont use this, im not sure what it works correctly
   */
  set isMatch(isMatch: boolean) {
    this.match.isMatch = isMatch;
  }

  mergeMatch(merge: Match) {
    const match = this.match.merge(merge);
    this.setMatch(match);
    return this;
  }

  private setMatch(match: Match) {
    this.match = match;
    this.factHash = match.factHash;
    this.hashCode = match.hashCode;
    this.aliases = match.aliases;
  }

  /**
   * Warning: paths not cloned
   */
  clone(fact?: Fact, paths?: IPattern[], match?: Match) {
    // return new Context(fact || this.fact, paths || this.paths, match || this.match);
    return new Context(fact || this.fact, paths, match || this.match);
  }
}
