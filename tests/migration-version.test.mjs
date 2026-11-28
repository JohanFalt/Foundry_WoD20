import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryEnv } from "./helpers/foundry-env.mjs";

// UpdateWorld decides whether to run the world migration by comparing versions
// (the comparison itself is a private helper inside migration.js). These tests
// exercise that decision through the public function.

installFoundryEnv();
const { UpdateWorld } = await import("../module/migration.js");

/** An empty world collection that records how often it was iterated. */
function worldCollection() {
    const collection = {
        invalidDocumentIds: [],
        visits: 0,
        getInvalid: () => undefined,
        [Symbol.iterator]() {
            collection.visits++;
            return [][Symbol.iterator]();
        }
    };
    return collection;
}

async function runUpdate(installedVersion, migrationVersion) {
    const env = installFoundryEnv();
    game.actors = worldCollection();
    game.items = worldCollection();
    game.packs = [];
    game.settings.set = async () => {};

    const infos = [];
    ui.notifications.info = message => infos.push(message);

    await UpdateWorld(installedVersion, migrationVersion);

    const migrated = game.actors.visits > 0;
    const announced = env.warnings.some(message => message.startsWith("Updating World"));
    return { migrated, announced, infos };
}

const cases = [
    // installed, target, should migrate
    ["7.3.2", "7.3.2", false],
    ["7.3.1", "7.3.2", true],
    ["7.2.9", "7.3.0", true],
    ["7.3.10", "7.3.2", false],
    ["7.3.2-alpha", "7.3.2", false],
    ["1", "7.3.2", true],
    ["", "7.3.2", true],
    ["7.3.2", "", false],
    [undefined, "7.3.2", false],
    ["7.3.2", undefined, false]
];

for (const [installed, target, shouldMigrate] of cases) {
    test(`installed ${JSON.stringify(installed)} -> ${JSON.stringify(target)} migrates: ${shouldMigrate}`, async () => {
        const result = await runUpdate(installed, target);

        assert.equal(result.migrated, shouldMigrate);
        assert.equal(result.announced, shouldMigrate);
        assert.equal(result.infos.at(-1), shouldMigrate ? "World updated to version 7.4.0!" : "Done!");
    });
}
