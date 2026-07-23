// Tiny className composer for mixing CSS-Module locals, global class strings,
// and conditionals. Falsy values are dropped.
//
//   cx(styles.card, isActive && styles.on, 'btn btn-primary')
export type ClassValue = string | number | false | null | undefined;

export function cx(...values: ClassValue[]): string {
  let out = '';
  for (const v of values) {
    if (!v) continue;
    out += (out ? ' ' : '') + v;
  }
  return out;
}

export default cx;
