import test from "node:test";
import assert from "node:assert/strict";
import { CONJUGATION_TYPES } from "../src/constants.js";
import { getBunproLessonUrl, BUNPRO_LESSONS } from "../src/engine/bunproLinks.js";

test("getBunproLessonUrl returns null for invalid or empty input", () => {
	assert.equal(getBunproLessonUrl(null), null);
	assert.equal(getBunproLessonUrl(undefined), null);
	assert.equal(getBunproLessonUrl({}), null);
	assert.equal(getBunproLessonUrl({ type: "UnknownType" }), null);
});

test("getBunproLessonUrl resolves polite verb endings", () => {
	const conj = { type: CONJUGATION_TYPES.present, polite: true, affirmative: true };
	const word = { type: "ru" };
	assert.equal(getBunproLessonUrl(conj, word), BUNPRO_LESSONS.politeVerbEndings);

	const pastPolite = { type: CONJUGATION_TYPES.past, polite: true, affirmative: false };
	assert.equal(getBunproLessonUrl(pastPolite, word), BUNPRO_LESSONS.politeVerbEndings);
});

test("getBunproLessonUrl resolves present plain verbs correctly", () => {
	// ru-verb affirmative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, polite: false, affirmative: true }, { type: "ru" }),
		BUNPRO_LESSONS.verbRuDict
	);

	// u-verb affirmative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, polite: false, affirmative: true }, { type: "u" }),
		BUNPRO_LESSONS.verbUDict
	);

	// ru-verb negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, polite: false, affirmative: false }, { type: "ru" }),
		BUNPRO_LESSONS.verbRuNeg
	);

	// u-verb negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, polite: false, affirmative: false }, { type: "u" }),
		BUNPRO_LESSONS.verbUNeg
	);

	// irregular verb fallback
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, polite: false, affirmative: true }, { type: "irv" }),
		BUNPRO_LESSONS.verbNonPast
	);
});

test("getBunproLessonUrl resolves past plain verbs correctly", () => {
	// ru-verb past affirmative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.past, polite: false, affirmative: true }, { type: "ru" }),
		BUNPRO_LESSONS.verbRuPast
	);

	// u-verb past affirmative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.past, polite: false, affirmative: true }, { type: "u" }),
		BUNPRO_LESSONS.verbUPast
	);

	// ru-verb past negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.past, polite: false, affirmative: false }, { type: "ru" }),
		BUNPRO_LESSONS.verbRuNegPast
	);

	// u-verb past negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.past, polite: false, affirmative: false }, { type: "u" }),
		BUNPRO_LESSONS.verbUNegPast
	);
});

test("getBunproLessonUrl resolves adjectives correctly", () => {
	// i-adjective present affirmative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, affirmative: true }, { type: "i" }),
		BUNPRO_LESSONS.adjI
	);

	// i-adjective present negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, affirmative: false }, { type: "i" }),
		BUNPRO_LESSONS.adjINeg
	);

	// na-adjective present affirmative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, affirmative: true }, { type: "na" }),
		BUNPRO_LESSONS.adjNa
	);

	// na-adjective present negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.present, affirmative: false }, { type: "na" }),
		BUNPRO_LESSONS.adjNaNeg
	);

	// i-adjective past
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.past, affirmative: true }, { type: "i" }),
		BUNPRO_LESSONS.adjIPast
	);

	// i-adjective past negative
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.past, affirmative: false }, { type: "i" }),
		BUNPRO_LESSONS.adjINegPast
	);

	// adverb
	assert.equal(
		getBunproLessonUrl({ type: CONJUGATION_TYPES.adverb }, { type: "i" }),
		BUNPRO_LESSONS.adverb
	);
});

test("getBunproLessonUrl resolves all advanced conjugation forms", () => {
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.te }), BUNPRO_LESSONS.verbTe);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.volitional, polite: false }), BUNPRO_LESSONS.volitionalPlain);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.volitional, polite: true }), BUNPRO_LESSONS.volitionalPolite);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.potential }), BUNPRO_LESSONS.potential);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.passive }), BUNPRO_LESSONS.passive);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.causative }), BUNPRO_LESSONS.causative);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.causativePassive }), BUNPRO_LESSONS.causativePassive);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.imperative }), BUNPRO_LESSONS.imperative);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.ba }), BUNPRO_LESSONS.ba);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.tara }), BUNPRO_LESSONS.tara);
	assert.equal(getBunproLessonUrl({ type: CONJUGATION_TYPES.tai }), BUNPRO_LESSONS.tai);
});
