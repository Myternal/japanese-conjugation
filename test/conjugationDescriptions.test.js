import test from "node:test";
import assert from "node:assert/strict";
import { CONJUGATION_TYPES } from "../src/constants.js";
import {
	CONJUGATION_DESCRIPTIONS,
	getConjugationDescription,
	getConjugationFormLabel,
} from "../src/engine/conjugationDescriptions.js";

test("CONJUGATION_DESCRIPTIONS covers all known conjugation types", () => {
	for (const typeKey of Object.values(CONJUGATION_TYPES)) {
		const entry = CONJUGATION_DESCRIPTIONS[typeKey];
		assert.ok(entry, `Missing description entry for type: ${typeKey}`);
		assert.ok(entry.name, `Missing name for type: ${typeKey}`);
		assert.ok(entry.affirmative, `Missing affirmative for type: ${typeKey}`);
		assert.ok(entry.negative, `Missing negative for type: ${typeKey}`);
		assert.ok(entry.tooltip, `Missing tooltip for type: ${typeKey}`);
	}
});

test("getConjugationDescription handles causative affirmative and negative", () => {
	const aff = getConjugationDescription({
		type: CONJUGATION_TYPES.causative,
		affirmative: true,
		polite: false,
	});
	assert.ok(aff);
	assert.equal(aff.name, "Causatif");
	assert.match(aff.shortText, /faire faire ou laisser faire/i);

	const neg = getConjugationDescription({
		type: CONJUGATION_TYPES.causative,
		affirmative: false,
		polite: false,
	});
	assert.ok(neg);
	assert.match(neg.shortText, /ne pas faire faire/i);
});

test("getConjugationDescription returns null for null or unknown conjugation", () => {
	assert.equal(getConjugationDescription(null), null);
	assert.equal(getConjugationDescription({}), null);
	assert.equal(getConjugationDescription({ type: "unknown" }), null);
});

test("getConjugationFormLabel toggles patterns (~...) correctly", () => {
	// When showPatterns is true
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.causative, true), "Causatif (〜させる)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.passive, true), "Passif (〜られる)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.volitional, true), "Volitionnel (〜よう)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.causativePassive, true), "Causatif-Passif (〜させられる)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.potential, true), "Potentiel (〜る / られる)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.ba, true), "Conditionnel 〜ば");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.tara, true), "Conditionnel 〜たら");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.tai, true), "Désiratif 〜たい");

	// When showPatterns is false, pattern endings (~...) are omitted
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.causative, false), "Causatif");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.passive, false), "Passif");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.volitional, false), "Volitionnel");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.causativePassive, false), "Causatif-Passif");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.potential, false), "Potentiel");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.ba, false), "Conditionnel (ba)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.tara, false), "Conditionnel (tara)");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.tai, false), "Désiratif");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.present, false), "Présent");
	assert.equal(getConjugationFormLabel(CONJUGATION_TYPES.past, false), "Passé");
});
