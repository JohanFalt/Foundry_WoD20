# ADR-1366-02 — Augment Attributes Foundry V14 integration checklist

The first-use collision test passed on Foundry V14.370 with runtime commit `8489237` on 2026-11-24. G1 (full integration) remains on hold. Unchecked scenarios below remain open.

## First use from the PC sheet

- [x] Opened Augment Attributes from the sheet icon in two Brave windows logged in as the same GM. The test PC had base Strength 1 and no managed Bonuses. Both windows prepared their first +1 before either created the Items.
- [x] One window created the three Bonuses. The other received a duplicate-ID error. After reloading, the PC had one Bonus per physical attribute, Strength +1 and total Strength 2.
- [x] Clicked +1 again in the window that had shown the error, with its popup still open. Both windows showed Strength +2 and total Strength 3. A second reload confirmed the same values and the same three Item IDs.

## Setup and rollback

- [ ] Install an unmodified upstream WoD20 V14-compatible release; record `game.system.id`, `game.system.version`, and the installed `calculateTotals` source revision. Check v7.3.3 separately if it becomes available.
- [ ] Stop Foundry and back up the isolated test world's data before any persistent test operation. Export the disposable PC Actor JSON as a secondary record. Record Actor UUID and managed Bonus IDs.
- [ ] Use a world PC Actor owned by the test user, with one visible Blood Pool Advantage and no unrelated active Shape or equipped Armor for the first run. Start the creation case without marked Bonuses; later cases use its three dedicated standalone `attribute_buff` items.
- [ ] Restore by stopping the isolated world and replacing its data from the backup; confirm Actor and Item values after restart. Never use a live user world for this checklist.

## Actual Foundry diff utility behavior

- [ ] In the browser console, compare two plain `actor.toObject()` snapshots with `foundry.utils.diffObject(before, after)` after changing only one calculated total in `after`. Record whether the result is nested or dot-path shaped and whether it includes `_id`, `items`, `flags`, or unrelated `system` fields.
- [ ] Repeat with identical snapshots (expect an empty diff), a changed `system.settings.isupdated`, and an item-array change. Record array replacement and deletion behavior. Do not pass an uninspected diff directly to `actor.update()`.
- [ ] Compare the utility's output with the controller's explicit narrow dot-path Actor update. Confirm that only changed total paths reach the Actor update hook and unrelated notes or biography fields survive.

## Controller behavior

- [ ] Confirm `foundry.utils.duplicate(actor)` produces a detached plain snapshot in V14: change a projected Bonus value, then verify the live Actor and Item are unchanged before any document API call.
- [ ] Confirm item creation yields exactly one Bonus per Physical Attribute with `flags.worldofdarkness.attributeAugmentation`, empty `parentid` and `bonuslist`, and `isremovable: false`; reopen the sheet and verify persistence.
- [ ] Change Dexterity Bonus by +2. Verify item value and active state update together; one-argument `calculateTotals(snapshot)` uses the projected Bonus; Actor Dexterity and Initiative totals update; roll Dexterity; Jog rises by 2 and Run by 6 on a plain PC without movement bonuses.
- [ ] Change Stamina Bonus by +2. Verify rollable Bashing and Lethal Soak changes and Aggravated Soak follows its setting. Test chimerical Soak separately when enabled.
- [ ] Add a separate active Attribute Bonus and a manual Attribute bonus; confirm neither is edited or discarded and both contribute through upstream calculations.
- [ ] Deactivate a managed Bonus while retaining a stored positive value; negative `changeValue` at zero effective value must preserve the stored value. `setValue(0)` and `reset()` must clear it.
- [ ] Hide or remove Blood Pool, then change to Earthbound in separate disposable cases. Increases and activation fail; reductions and reset work without creating missing Bonus items.
- [ ] Corrupt a marked Bonus's type, settingtype, parentid, or bonuslist in separate disposable cases. Confirm `CONFLICT` before any controller item write. Duplicate markers, even clean zeros, must also produce `CONFLICT` without deletion.
- [ ] Run rapid increments from one client. Confirm the UUID queue serializes them. With two clients, record races and confirm no claim of distributed locking or atomicity.
- [ ] During a delayed projection, hide Blood Pool or change Actor ownership before the first Item write. Confirm the operation fails without an Item write. Change an Attribute base during Actor total persistence; confirm the local source-drift check reports a retryable concurrent modification. Repeat with another client to record races that remain undetectable.
- [ ] Simulate a failure between Item and Actor persistence. Confirm the error remains visible and a later mutating operation recalculates Actor totals from current items.
- [ ] Reload the browser and restart the isolated world. Confirm embedded Bonus values, Actor totals, roll pool, movement and Soak; record any derived value that does not survive preparation or restart.

## Caller contract after an error

`AttributeAugmentationError.itemsApplied` reports local observation: `true` means at least one managed Item write passed its postcondition, `false` means no Item write was attempted, and `null` means an attempted Item write could not be verified. `TOTALS_PERSISTENCE_FAILED` identifies an Actor totals update failure; the Item state may already have changed. These checks do not prove durable server storage or atomicity across clients.

After a partial-persistence error, reread the current Actor and managed Bonus values. Never automatically retry a relative increment or decrement without inspecting the actual state. A later explicit `ensure()` can recalculate stale Actor totals when the Actor is eligible.

## Known calculation boundaries

- [ ] Equipped Armor: compare one-argument `calculateTotals(snapshot)` with actual Actor totals, including Dexterity penalty and Soak. The upstream calculation looks up `game.actors.get(snapshot._id)` for Armor.
- [ ] Active Shapes: repeat with a Shape that overrides Soak rollability. Check that the live Actor lookup and snapshot agree; record any mismatch.
- [ ] Unlinked tokens: repeat only on a disposable token Actor. Check whether `game.actors.get(snapshot._id)` resolves the token Actor, base Actor, or nothing; do not infer world-Actor success applies to tokens.
- [ ] Review numeric overflow cases separately with safe-integer inputs. Do not use extreme values in dice rolls until the roller's behavior is explicitly tested.
