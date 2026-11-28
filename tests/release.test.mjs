import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Static checks on the repository itself. Nothing here starts Foundry; these
// tests catch the mistakes that most often break a release: a broken manifest,
// a missing file, a version that was bumped in one place only, a translation key
// that does not exist, or a template or module that cannot be loaded.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SYSTEM_PREFIX = "systems/worldofdarkness/";

// Known problems found when these tests were written. They are listed here so the
// suite stays green while the bugs are open. Remove an entry when its bug is fixed;
// the test fails if an entry is no longer needed, so the list cannot go stale.
// Format: ["wod.some.key", "where it is used and why it is missing"]
const KNOWN_MISSING_KEYS = new Map([]);

// Import cycles that exist today. Each module uses the other only inside functions,
// so the cycle does not affect loading. Any other cycle fails the test.
const KNOWN_IMPORT_CYCLES = [
    ["module/scripts/combat-helpers.js", "module/scripts/roll-dice.js"]
];

const manifest = readJson("system.json");
const packageJson = readJson("package.json");

function readText(relativePath) {
    return readFileSync(join(ROOT, relativePath), "utf8").replace(/^\uFEFF/, "");
}

function readJson(relativePath) {
    return JSON.parse(readText(relativePath));
}

function walk(directory, extension) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const fullPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath, extension));
        }
        else if (entry.name.endsWith(extension)) {
            files.push(fullPath);
        }
    }
    return files;
}

function toRepoPath(absolutePath) {
    return relative(ROOT, absolutePath).split(sep).join("/");
}

/** Module entry points: wod.js plus everything under module/. */
function moduleScripts() {
    return [join(ROOT, "wod.js"), ...walk(join(ROOT, "module"), ".js")];
}

function templateFiles() {
    return walk(join(ROOT, "templates"), ".hbs");
}

/** Flattens nested language objects ({ "wod": { "bio": { "name": ... } } }) into dotted keys. */
function flatten(object, prefix = "", out = new Map()) {
    for (const [key, value] of Object.entries(object)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object") {
            flatten(value, fullKey, out);
        }
        else {
            out.set(fullKey, value);
        }
    }
    return out;
}

function isFile(relativePath) {
    return existsSync(join(ROOT, relativePath)) && statSync(join(ROOT, relativePath)).isFile();
}

test("system.json has the fields Foundry needs", () => {
    assert.equal(manifest.id, "worldofdarkness");
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    assert.equal(manifest.compatibility.minimum, "14");
    assert.equal(manifest.compatibility.verified, "14");
    assert.equal(manifest.compatibility.maximum, "14");
    assert.ok(manifest.esmodules.length > 0, "esmodules is empty");
    assert.ok(manifest.languages.some(language => language.lang === "en"), "English language is missing");
});

test("template.json parses and defines the Actor and Item types", () => {
    const template = readJson("template.json");

    assert.ok(template.Actor, "Actor section is missing");
    assert.ok(template.Item, "Item section is missing");
});

test("every file listed in esmodules, styles and languages exists", () => {
    const listed = [
        ...manifest.esmodules,
        ...manifest.styles,
        ...manifest.languages.map(language => language.path)
    ];
    const missing = listed.filter(path => !isFile(path));

    assert.deepEqual(missing, []);
});

test("every compendium pack folder listed in system.json exists", () => {
    const missing = manifest.packs
        .map(pack => pack.path)
        .filter(path => !existsSync(join(ROOT, path)));

    assert.deepEqual(missing, []);
});

test("the version in package.json matches system.json", () => {
    assert.equal(packageJson.version, manifest.version);
});

test("the manifest and download URLs point at the current version", () => {
    assert.ok(manifest.manifest.includes(`/v${manifest.version}/`), "manifest URL has a different version");
    assert.ok(manifest.download.includes(`/v${manifest.version}/`), "download URL has a different version");
});

test("every language file is valid JSON", () => {
    for (const language of manifest.languages) {
        assert.doesNotThrow(() => readJson(language.path), `${language.path} is not valid JSON`);
    }
});

test("every localization key used in templates and scripts exists in en.json", () => {
    const english = flatten(readJson("lang/en.json"));
    const used = new Map();

    const remember = (key, source) => {
        if (!used.has(key)) {
            used.set(key, source);
        }
    };

    for (const file of templateFiles()) {
        const source = toRepoPath(file);
        for (const match of readFileSync(file, "utf8").matchAll(/\{\{\s*(?:localize|format)\s+(['"])([^'"]+)\1/g)) {
            remember(match[2], source);
        }
    }

    for (const file of moduleScripts()) {
        const source = toRepoPath(file);
        for (const match of readFileSync(file, "utf8").matchAll(/i18n\.(?:localize|format)\(\s*(["'`])([^"'`$]+)\1/g)) {
            remember(match[2], source);
        }
    }

    // Labels in config.js are passed to localize() later, so they are keys too.
    for (const match of readText("module/config.js").matchAll(/(["'`])(wod\.[A-Za-z0-9_.]+)\1/g)) {
        remember(match[2], "module/config.js");
    }

    // A key that ends with "." is built at runtime ("wod.labels.add." + name), so it cannot be checked here.
    const missing = new Map([...used.entries()]
        .filter(([key]) => !key.endsWith(".") && !english.has(key)));

    const unexpected = [...missing.entries()]
        .filter(([key]) => !KNOWN_MISSING_KEYS.has(key))
        .map(([key, source]) => `${key} (${source})`)
        .sort();
    const stale = [...KNOWN_MISSING_KEYS.keys()].filter(key => !missing.has(key));

    assert.deepEqual(unexpected, [], "missing translation keys");
    assert.deepEqual(stale, [], "known missing keys that are now fixed; remove them from KNOWN_MISSING_KEYS");
});

test("translations are complete compared with en.json", t => {
    const english = [...flatten(readJson("lang/en.json")).keys()];

    for (const language of manifest.languages.filter(entry => entry.lang !== "en")) {
        const translated = flatten(readJson(language.path));
        const missing = english.filter(key => !translated.has(key));

        // Foundry falls back to English for missing keys, so this is reported, not failed.
        t.diagnostic(`${language.lang}: ${missing.length} of ${english.length} keys fall back to English`);
    }
});

test("every template path used by a partial or a script exists", () => {
    const missing = [];

    for (const file of templateFiles()) {
        for (const match of readFileSync(file, "utf8").matchAll(/\{\{>\s*(?:"([^"]+)"|'([^']+)'|([^\s}]+))/g)) {
            const path = match[1] ?? match[2] ?? match[3];
            if (path.startsWith(SYSTEM_PREFIX) && !isFile(path.slice(SYSTEM_PREFIX.length))) {
                missing.push(`${path} (used in ${toRepoPath(file)})`);
            }
        }
    }

    for (const file of moduleScripts()) {
        for (const match of readFileSync(file, "utf8").matchAll(/systems\/worldofdarkness\/(templates\/[^"'`\s$]+\.hbs)/g)) {
            if (!isFile(match[1])) {
                missing.push(`${match[1]} (used in ${toRepoPath(file)})`);
            }
        }
    }

    assert.deepEqual(missing, []);
});

test("every Handlebars block is opened and closed in the same file", () => {
    const problems = [];

    for (const file of templateFiles()) {
        const source = readFileSync(file, "utf8").replace(/\{\{!--[\s\S]*?--\}\}|\{\{![\s\S]*?\}\}/g, "");
        const stack = [];

        // Opening tags may be {{#name}}, {{#*inline "x"}} or {{#> partial}}.
        const tags = [...source.matchAll(/\{\{~?#[>*]?\s*([\w-]+)|\{\{~?\/([\w-]+)/g)];
        for (const match of tags) {
            if (match[1] !== undefined) {
                stack.push(match[1]);
            }
            else if (stack.pop() !== match[2]) {
                problems.push(`${toRepoPath(file)}: unexpected {{/${match[2]}}}`);
                break;
            }
        }

        if (stack.length > 0) {
            problems.push(`${toRepoPath(file)}: unclosed {{#${stack.at(-1)}}}`);
        }
    }

    assert.deepEqual(problems, []);
});

test("every Handlebars expression has matching braces", () => {
    const unbalanced = templateFiles().filter(file => {
        const source = readFileSync(file, "utf8").replace(/\{\{!--[\s\S]*?--\}\}/g, "");
        const opened = (source.match(/\{\{/g) ?? []).length;
        const closed = (source.match(/\}\}/g) ?? []).length;
        return opened !== closed;
    });

    assert.deepEqual(unbalanced.map(toRepoPath), []);
});

test("every module script parses", () => {
    const failures = [];

    for (const file of moduleScripts()) {
        const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
        if (result.status !== 0) {
            failures.push(`${toRepoPath(file)}: ${result.stderr.trim().split("\n").slice(0, 3).join(" ")}`);
        }
    }

    assert.deepEqual(failures, []);
});

test("relative imports point at existing files", () => {
    const missing = [];

    for (const file of moduleScripts()) {
        for (const specifier of importsOf(file)) {
            const target = resolve(dirname(file), specifier);
            if (!existsSync(target)) {
                missing.push(`${specifier} (imported from ${toRepoPath(file)})`);
            }
        }
    }

    assert.deepEqual(missing, []);
});

test("module scripts do not import each other in a cycle", () => {
    const graph = new Map();
    for (const file of moduleScripts()) {
        graph.set(file, importsOf(file).map(specifier => resolve(dirname(file), specifier)));
    }

    // Compare cycles by the set of files they contain, since the same cycle can be found from several starting points.
    const signature = files => [...new Set(files.map(toRepoPath))].sort().join(" | ");
    const known = new Set(KNOWN_IMPORT_CYCLES.map(files => [...files].sort().join(" | ")));
    const found = findCycles(graph);
    const foundSignatures = new Set(found.map(signature));

    const unexpected = found
        .filter(cycle => !known.has(signature(cycle)))
        .map(cycle => cycle.map(toRepoPath).join(" -> "));
    const stale = [...known].filter(sig => !foundSignatures.has(sig));

    assert.deepEqual(unexpected, [], "new import cycle");
    assert.deepEqual(stale, [], "known import cycle no longer exists; remove it from KNOWN_IMPORT_CYCLES");
});

/** Relative module specifiers in import and export statements. */
function importsOf(file) {
    const source = readFileSync(file, "utf8");
    const specifiers = [];

    for (const match of source.matchAll(/\b(?:import|export)\b[^'"`;]*?\bfrom\s*["'](\.[^"']+)["']/g)) {
        specifiers.push(match[1]);
    }
    for (const match of source.matchAll(/\bimport\s*["'](\.[^"']+)["']/g)) {
        specifiers.push(match[1]);
    }

    return specifiers;
}

/** Depth-first search that reports each cycle once, as the path that closes it. */
function findCycles(graph) {
    const cycles = [];
    const finished = new Set();
    const onPath = [];

    const visit = node => {
        const index = onPath.indexOf(node);
        if (index !== -1) {
            cycles.push([...onPath.slice(index), node]);
            return;
        }
        if (finished.has(node) || !graph.has(node)) {
            return;
        }

        onPath.push(node);
        for (const next of graph.get(node)) {
            visit(next);
        }
        onPath.pop();
        finished.add(node);
    };

    for (const node of graph.keys()) {
        visit(node);
    }

    return cycles;
}
