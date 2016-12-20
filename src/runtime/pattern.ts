import { IConstraint, IFromConstraint } from '../constraint';
import cst from './constraint';
import { IPattern, IObjectPattern, patternType, IFromPattern } from '../pattern';
const funcs = new Map<patternType, (pattern: IPattern, defines: Map<string, any>, scope: Map<string, any>) => IObjectPattern>();

function obj(pattern: IObjectPattern, defines: Map<string, any>, scope: Map<string, any>) {
	const class_type = defines.get(pattern.cls);
	const constraints = pattern.constraints.map((constraint) => {
		return cst(constraint, defines, scope);
	});
	// const constraints: IConstraint[] = null;
	return {
		type: pattern.type,
		id: pattern.id,
		class_type: class_type,
		alias: pattern.alias,
		pattern: pattern.pattern,
		constraints: constraints
	};
}
funcs.set(patternType.object, obj);
funcs.set(patternType.initial_fact, obj);
funcs.set(patternType.not, obj);
funcs.set(patternType.exists, obj);

function from(pattern: IFromPattern, defines: Map<string, any>, scope: Map<string, any>) {
	const from = pattern.from;
	pattern = obj(pattern, defines, scope) as IFromPattern;
	pattern.from = cst(from, defines, scope) as IFromConstraint;
	return pattern;
}
funcs.set(patternType.from, from);
funcs.set(patternType.from_exists, from);
funcs.set(patternType.from_not, from);

export default function pt(pattern: IPattern, defines: Map<string, any>, scope: Map<string, any>) {
	const fun = funcs.get(pattern.type);
	return fun ? fun(pattern, defines, scope) : pattern;
}
