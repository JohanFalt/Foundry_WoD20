/**
 * Shared option helpers for `{{selectOptions ...}}`.
 *
 * - `selectPlaceholder(labelKey)`: returns "- <localized labelKey> -"
 * - `makeLocalizedOptionMap(values, opts)`: returns `{ valueKey: localizedLabel, ... }`
 *
 * These are used to build `listData.*` that templates consume with `localize=false`
 * (meaning the labels are already localized here).
 */

export function selectPlaceholder(labelKey = "wod.labels.select") {
  return `- ${game.i18n.localize(labelKey)} -`;
}

export function makeLocalizedOptionMap(
  values,
  { includeEmpty = true, emptyLabelKey = "wod.labels.select" } = {}
) {
  const map = {};
  if (includeEmpty) map[""] = selectPlaceholder(emptyLabelKey);
  for (const v of values) map[v] = game.i18n.localize(v);
  return map;
}
























