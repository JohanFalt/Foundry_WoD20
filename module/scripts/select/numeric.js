/**
 * Numeric helper lists used across many templates.
 *
 * Exposes:
 * - `getValueList(begin, end, startValue, headline)` -> array of `{value,label}` with optional headline.
 * - `getGeneration()` -> Vampire generation list (4..16).
 */

export function getValueList(begin, end, startvalue, headline) {
  const values = [
    {
      value: "",
      label: headline
    }
  ];

  for (let i = begin; i < end; i++) {
    values.push({
      value: i,
      label: i.toString()
    });
  }

  return values;
}

export function getGeneration() {
  const generationlist = [];
  for (let i = 4; i < 17; i++) {
    generationlist.push({
      value: i,
      label: i.toString()
    });
  }
  return generationlist;
}
























