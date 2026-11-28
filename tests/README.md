# Tests

Automated tests for the World of Darkness system. They run in plain Node.js, without Foundry, using the built-in test runner (`node:test`).

The tests cover the calculations that most often break between releases (totals, soak, damage, dice, bonuses) and a set of static checks on the manifest, language files, templates and scripts. Shared test helpers live in `tests/helpers/`.

## Running the tests

You need Node.js 20 or newer. The suite has been verified on Node 24.

```
npm test
```

To run a single file:

```
node --test tests/totals.test.mjs
```

To run only the tests whose name matches a pattern:

```
node --test --test-name-pattern="soak" "tests/*.test.mjs"
```

Keep the quotes around the glob. Without them the shell may not expand the pattern (Windows does not), and `node --test tests` fails on Node 24 because it treats `tests` as a module path.

## What is covered

| File | Covers |
| --- | --- |
| `release.test.mjs` | `system.json`, `template.json`, `package.json` and the language files; that every file listed in the manifest exists; translation keys used in templates and scripts; partials and template paths; Handlebars block structure; syntax of every module script; relative imports and import cycles. |
| `totals.test.mjs` | `calculateTotals`: attribute totals and buffs, fixed values, health buffs, soak, armor, initiative, the spirit variant, and repeated calculation. |
| `combat-helpers.test.mjs` | Health levels, damage capacity, applying damage with overflow, ignored pain and movement. |
| `health.test.mjs` | `calculateHealth` for a mortal and for a Wraith with Corpus, plus the Corpus helpers. |
| `bonus-helpers.test.mjs` | The `Check` and `Get` functions for attribute, fixed value, soak, initiative, health and movement bonuses. |
| `dice-roll.test.mjs` | `DiceRoller` with scripted dice: difficulty, tens and ones, botches, willpower, wound penalty, specialities, exploding dice, and soak and damage rolls. |
| `dialog-generalroll.test.mjs` | `GeneralRoll` setup for attribute, ability and dice rolls, and how `DialogGeneralRoll` groups abilities into talents, skills and knowledges. |
| `migration-version.test.mjs` | Which installed and target versions run the world migration, through `UpdateWorld`. |
| `attribute-augmentation-helpers.test.mjs` | `module/scripts/attribute-augmentation-helpers.js`: reading, creating and updating the managed Bonus items, conflict detection, error codes, and the interaction with the real `calculateTotals`. |
| `attribute-augmentation-popup.test.mjs` | `module/ui/attribute-augmentation-popup.js`: who sees the icon, popup lifecycle, refresh on document hooks, error and notice messages, and the splat class on the window. |
| `bio-visibility.test.mjs` | `module/scripts/bio-visibility.js`: the viewer type (GM, owner, limited, observers), and per-field Bio visibility where a missing flag means visible. |

Not covered: full sheets and dialogs in a running Foundry instance. Those still need to be checked by hand.

## How the tests work

Foundry is not available under Node, so the tests provide the globals the code touches. Two helpers in `tests/helpers/` do most of the work:

- `foundry-env.mjs` exports `installFoundryEnv({ config, settings, actors, combat })`. It sets `game`, `CONFIG.worldofdarkness` (a copy of the configuration in `module/config.js`), `Hooks`, `ui`, `ChatMessage`, `canvas`, `FormApplication` and the `foundry` namespace. It returns the recorded `warnings`, `chatMessages` and `renderedTemplates` so a test can assert on them.
- `fake-actor.mjs` builds plain actor and item objects shaped like the data model: `createPcActor`, `createBonus`, `createAdvantage` and `createAbility`. `actorDocument` adds an `items.get()` and an `update()` for code that uses them.
- `scripted-roll.mjs` exports `installScriptedRoll(faces)`, which replaces `Roll` with one that returns a fixed sequence of die results.

Call `installFoundryEnv()` before you import a module with a dynamic `import()`. Some modules read globals when they are first loaded. Each test file runs in its own process, so globals do not leak between files.

A few things worth knowing:

- **Application classes are faked.** The popup test replaces `ApplicationV2` with a small class that tracks renders, close listeners and the last prepared context. `HandlebarsApplicationMixin` is an identity function.
- **Localization returns keys.** `game.i18n.localize` and `game.i18n.format` return the key unchanged. Tests never compare against translated text. Assert on the key instead, for example `/error\.applied/`. This keeps tests stable when wording changes.
- **Real code is used where it is cheap.** The helper and totals tests run the actual `calculateTotals` and bonus functions rather than stubs, so a change in those calculations can break them on purpose.
- **Some private functions are tested through their public caller.** The version comparison in `migration.js` is a private function, so `migration-version.test.mjs` tests it through `UpdateWorld`.
- **Actors are plain objects.** Keep `actor.system` in the shape of the real data model when you add fields to a fixture.

## Release checks

`release.test.mjs` reads the repository and does not start Foundry. It fails when:

- `system.json` or `template.json` is not valid JSON, or a file listed in `esmodules`, `styles`, `languages` or `packs` is missing,
- the version in `package.json` differs from `system.json`, or the manifest and download URLs point at another version,
- a translation key used in a template or script is not in `lang/en.json`,
- a template references a partial or a template file that does not exist,
- a Handlebars block is opened and not closed,
- a module script has a syntax error,
- a relative import points at a missing file, or two modules import each other in a cycle.

Languages other than English are compared with `lang/en.json` as well. Missing keys there fall back to English in Foundry, so the test prints the count for each language and does not fail.

### Known problems

A problem that cannot be fixed yet can be listed in `KNOWN_MISSING_KEYS` at the top of `release.test.mjs`, so the suite stays green while it is open. The list is empty now. The test fails if an entry is no longer needed, so remove an entry when you fix its problem.

Import cycles are listed in `KNOWN_IMPORT_CYCLES`. The cycle between `combat-helpers.js` and `roll-dice.js` is harmless today, because each module uses the other only inside functions.

Keys that end with a dot, such as `"wod.labels.add." + name`, are built at runtime and are skipped.

## Writing a new test

Put the file in `tests/` and name it `<module>.test.mjs`. Use `node:test` and `node:assert/strict` only.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";
import { createPcActor } from "./helpers/fake-actor.mjs";

installFoundryEnv();

const { someFunction } = await import("../module/scripts/some-module.js");

test("describes the behaviour, not the implementation", () => {
	const actor = createPcActor();
	assert.equal(someFunction(actor, { input: 1 }), 2);
});
```

Guidelines:

- Test outcomes: return values, writes to the actor or its items, error codes. Avoid asserting on private helpers.
- When you fix a bug, add a test that fails without the fix.
- Keep test-only code in the test or in `tests/helpers/`. Do not add test branches to production code.
- Do not leave `.only` or `.skip` in committed tests.
- If you change an existing test to make it pass, explain why in the pull request.

## Before a release

1. Run `npm test` and make sure everything passes.
2. Check that every new calculation has a test.
3. Check that the version in `system.json` and `package.json` is the same.
4. Add a key to `lang/en.json` for every new `localize` or `format` call.
