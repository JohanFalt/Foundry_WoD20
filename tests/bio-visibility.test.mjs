import assert from "node:assert/strict";
import test from "node:test";
import {
    BIO_FIXED_FIELDS, BIO_VIEWERS, splatFieldId, getBioViewer, isBioFieldVisible
} from "../module/scripts/bio-visibility.js";

test("the fixed Bio fields and viewers are listed once each", () => {
    const ids = BIO_FIXED_FIELDS.map(field => field.id);
    assert.deepEqual(ids, ["nature", "demeanor", "concept", "derangement", "appearance", "background"]);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(BIO_VIEWERS, ["limited", "observers"]);
});

test("template fields get a prefixed id so they cannot clash with fixed fields", () => {
    assert.equal(splatFieldId("affinity"), "splat_affinity");
    assert.notEqual(splatFieldId("nature"), "nature");
});

test("GM and owners are always the full viewer, even when the actor is limited", () => {
    assert.equal(getBioViewer({ isGM: true, limited: true }), "full");
    assert.equal(getBioViewer({ isOwner: true, limited: true }), "full");
});

test("non-owners are limited or observers depending on their permission", () => {
    assert.equal(getBioViewer({ limited: true }), "limited");
    assert.equal(getBioViewer({ limited: false }), "observers");
    assert.equal(getBioViewer({}), "observers");
});

test("a field is visible when no flag has been stored", () => {
    assert.equal(isBioFieldVisible(undefined, "nature", "limited"), true);
    assert.equal(isBioFieldVisible({}, "nature", "observers"), true);
    assert.equal(isBioFieldVisible({ nature: {} }, "nature", "limited"), true);
});

test("an explicit false hides the field only for the viewer it is set for", () => {
    const visibility = { nature: { limited: false, observers: true } };
    assert.equal(isBioFieldVisible(visibility, "nature", "limited"), false);
    assert.equal(isBioFieldVisible(visibility, "nature", "observers"), true);
    assert.equal(isBioFieldVisible(visibility, "concept", "limited"), true);
});

test("the full viewer always sees the field, whatever the flags say", () => {
    const visibility = { nature: { limited: false, observers: false } };
    assert.equal(isBioFieldVisible(visibility, "nature", "full"), true);
});

test("hiding one field does not hide the others", () => {
    const visibility = { splat_affinity: { limited: false, observers: false } };
    assert.equal(isBioFieldVisible(visibility, "splat_affinity", "observers"), false);
    assert.equal(isBioFieldVisible(visibility, "splat_other", "observers"), true);
    assert.equal(isBioFieldVisible(visibility, "background", "limited"), true);
});
