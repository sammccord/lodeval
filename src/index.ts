import _ from 'lodash';

export const INITIAL = '{{INITIAL}}';
export const CONTEXT = '{{CONTEXT}}';
export const SCRATCH = '{{SCRATCH}}';

export function lodeval<T = any>(
  instructions: Array<any>,
  options: { initial?: any; scratch?: any; helpers?: any },
  _context?: any
): T {
  const { initial = {}, scratch = {}, helpers = {} } = options;
  let context = _context || structuredClone(initial);
  const maybeInstruction = instructions.at(0);
  if (_[maybeInstruction] || helpers[maybeInstruction]) instructions = [instructions];
  for (let [method, ...args] of instructions) {
    function mapper(arg: any) {
      if (arg === INITIAL) return initial;
      if (arg === CONTEXT) return context;
      if (arg === SCRATCH) return scratch;
      if (Array.isArray(arg)) {
        const _maybeInstruction = arg.at(0);
        if (_[_maybeInstruction] || helpers[_maybeInstruction]) {
          context = lodeval(arg, options, context);
          return context;
        }
        return arg.map(mapper);
      }
      if (typeof arg === 'string' && helpers[arg]) return helpers[arg];
      return arg;
    }
    const mappedArgs = args.map(mapper);
    context = (_[method] || helpers[method])(...mappedArgs);
  }
  return context;
}
