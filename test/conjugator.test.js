import test from "node:test";
import assert from "node:assert/strict";

import {
	conjugationFunctions,
	ikuConjugation,
	suruConjugation,
	kuruConjugation,
	aruConjugation,
	iiConjugation,
	getAllConjugations,
} from "../src/engine/conjugator.js";
import { CONJUGATION_TYPES, PARTS_OF_SPEECH } from "../src/constants.js";

test("Regular Godan verbs - 飲む (nomu)", () => {
	const verb = "飲む";
	const vf = conjugationFunctions[PARTS_OF_SPEECH.verb];

	// Present
	assert.equal(vf[CONJUGATION_TYPES.present](verb, "u", true, true), "飲みます");
	assert.equal(vf[CONJUGATION_TYPES.present](verb, "u", true, false), "飲む");
	assert.deepEqual(vf[CONJUGATION_TYPES.present](verb, "u", false, true), ["飲みません", "飲まないです"]);
	assert.equal(vf[CONJUGATION_TYPES.present](verb, "u", false, false), "飲まない");

	// Past
	assert.equal(vf[CONJUGATION_TYPES.past](verb, "u", true, true), "飲みました");
	assert.equal(vf[CONJUGATION_TYPES.past](verb, "u", true, false), "飲んだ");
	assert.deepEqual(vf[CONJUGATION_TYPES.past](verb, "u", false, true), ["飲みませんでした", "飲まなかったです"]);
	assert.equal(vf[CONJUGATION_TYPES.past](verb, "u", false, false), "飲まなかった");

	// Te form
	assert.equal(vf[CONJUGATION_TYPES.te](verb, "u"), "飲んで");

	// Ba form (conditional)
	assert.equal(vf[CONJUGATION_TYPES.ba](verb, "u", true, false), "飲めば");
	assert.deepEqual(vf[CONJUGATION_TYPES.ba](verb, "u", false, false), ["飲まなければ", "飲まなきゃ"]);

	// Tara form (conditional past)
	assert.equal(vf[CONJUGATION_TYPES.tara](verb, "u", true, false), "飲んだら");
	assert.equal(vf[CONJUGATION_TYPES.tara](verb, "u", false, false), "飲まなかったら");

	// Tai form (desiderative)
	assert.equal(vf[CONJUGATION_TYPES.tai](verb, "u", true, true), "飲みたいです");
	assert.equal(vf[CONJUGATION_TYPES.tai](verb, "u", true, false), "飲みたい");
	assert.deepEqual(vf[CONJUGATION_TYPES.tai](verb, "u", false, true), ["飲みたくないです", "飲みたくありません"]);
	assert.equal(vf[CONJUGATION_TYPES.tai](verb, "u", false, false), "飲みたくない");

	// Passive & Causative & Potential
	assert.equal(vf[CONJUGATION_TYPES.passive](verb, "u", true, false), "飲まれる");
	assert.equal(vf[CONJUGATION_TYPES.causative](verb, "u", true, false), "飲ませる");
	assert.deepEqual(vf[CONJUGATION_TYPES.potential](verb, "u", true, false), ["飲める"]);
});

test("Regular Ichidan verbs - 食べる (taberu)", () => {
	const verb = "食べる";
	const vf = conjugationFunctions[PARTS_OF_SPEECH.verb];

	assert.equal(vf[CONJUGATION_TYPES.present](verb, "ru", true, true), "食べます");
	assert.equal(vf[CONJUGATION_TYPES.past](verb, "ru", true, false), "食べた");
	assert.equal(vf[CONJUGATION_TYPES.te](verb, "ru"), "食べて");
	assert.equal(vf[CONJUGATION_TYPES.ba](verb, "ru", true, false), "食べれば");
	assert.deepEqual(vf[CONJUGATION_TYPES.ba](verb, "ru", false, false), ["食べなければ", "食べなきゃ"]);
	assert.equal(vf[CONJUGATION_TYPES.tara](verb, "ru", true, false), "食べたら");
	assert.equal(vf[CONJUGATION_TYPES.tai](verb, "ru", true, false), "食べたい");
	assert.equal(vf[CONJUGATION_TYPES.passive](verb, "ru", true, false), "食べられる");
	assert.equal(vf[CONJUGATION_TYPES.causative](verb, "ru", true, false), "食べさせる");
	assert.deepEqual(vf[CONJUGATION_TYPES.potential](verb, "ru", true, false), ["食べられる", "食べれる"]);
});

test("Irregular verb 行く (iku)", () => {
	assert.equal(ikuConjugation(true, false, CONJUGATION_TYPES.te, true), "行って");
	assert.equal(ikuConjugation(true, false, CONJUGATION_TYPES.past, true), "行った");
	assert.equal(ikuConjugation(true, false, CONJUGATION_TYPES.ba, true), "行けば");
	assert.equal(ikuConjugation(true, false, CONJUGATION_TYPES.tara, true), "行ったら");
	assert.equal(ikuConjugation(true, false, CONJUGATION_TYPES.tai, true), "行きたい");
});

test("Irregular verb する (suru)", () => {
	assert.equal(suruConjugation(true, true, CONJUGATION_TYPES.present), "します");
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.te), "して");
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.ba), "すれば");
	assert.deepEqual(suruConjugation(false, false, CONJUGATION_TYPES.ba), ["しなければ", "しなきゃ"]);
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.tara), "したら");
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.tai), "したい");
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.passive), "される");
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.causative), "させる");
	assert.equal(suruConjugation(true, false, CONJUGATION_TYPES.causativePassive), "させられる");
	assert.deepEqual(suruConjugation(true, false, CONJUGATION_TYPES.potential), ["できる", "出来る"]);
});

test("Irregular verb 来る (kuru)", () => {
	assert.equal(kuruConjugation(true, true, CONJUGATION_TYPES.present, true), "来ます");
	assert.equal(kuruConjugation(true, false, CONJUGATION_TYPES.te, true), "来て");
	assert.equal(kuruConjugation(true, false, CONJUGATION_TYPES.ba, true), "来れば");
	assert.deepEqual(kuruConjugation(false, false, CONJUGATION_TYPES.ba, true), ["来なければ", "来なきゃ"]);
	assert.equal(kuruConjugation(true, false, CONJUGATION_TYPES.tara, true), "来たら");
	assert.equal(kuruConjugation(true, false, CONJUGATION_TYPES.tai, true), "来たい");
});

test("Irregular adjective いい (ii)", () => {
	assert.deepEqual(iiConjugation(true, false, CONJUGATION_TYPES.present), ["いい", "良い"]);
	assert.deepEqual(iiConjugation(true, false, CONJUGATION_TYPES.past), ["よかった", "良かった"]);
	assert.deepEqual(iiConjugation(true, false, CONJUGATION_TYPES.adverb), ["よく", "良く"]);
	assert.deepEqual(iiConjugation(true, false, CONJUGATION_TYPES.ba), ["よければ", "良ければ"]);
	assert.deepEqual(iiConjugation(true, false, CONJUGATION_TYPES.tara), ["よかったら", "良かったら"]);
});

test("getAllConjugations returns valid list", () => {
	const wordJSON = {
		kanji: "<ruby>食<rt>た</rt></ruby>べる",
		type: "ru",
		eng: "eat"
	};
	const conjs = getAllConjugations(wordJSON);
	assert.ok(conjs.length > 10);
	const forms = conjs.map(c => c.type);
	assert.ok(forms.includes(CONJUGATION_TYPES.present));
	assert.ok(forms.includes(CONJUGATION_TYPES.past));
	assert.ok(forms.includes(CONJUGATION_TYPES.te));
	assert.ok(forms.includes(CONJUGATION_TYPES.ba));
	assert.ok(forms.includes(CONJUGATION_TYPES.tara));
	assert.ok(forms.includes(CONJUGATION_TYPES.tai));
});

test("generateDokkaiChallenge produces 4 options and valid correctIndex", async () => {
	const { generateDokkaiChallenge } = await import("../src/engine/deconjugator.js");
	const wordList = [
		{ kanji: "<ruby>食<rt>た</rt></ruby>べる", type: "ru", eng: "eat" },
		{ kanji: "<ruby>飲<rt>の</rt></ruby>む", type: "u", eng: "drink" },
		{ kanji: "<ruby>行<rt>い</rt></ruby>く", type: "irv", eng: "go" }
	];
	const challenge = generateDokkaiChallenge(wordList);
	assert.ok(challenge != null);
	assert.ok(challenge.prompt.length > 0);
	assert.equal(challenge.options.length, 4);
	assert.ok(challenge.correctIndex >= 0 && challenge.correctIndex < 4);
	assert.equal(challenge.options[challenge.correctIndex], challenge.correctLabel);
});

test("SessionManager records stats and exports mistakes in TSV", async () => {
	const { SessionManager, GAME_MODES } = await import("../src/engine/gameModes.js");
	const session = new SessionManager();
	session.setMode(GAME_MODES.SPRINT);
	session.markQuestionStart();

	session.recordAnswer(true, { question: "飲む - Past", expected: "飲んだ" });
	session.markQuestionStart();
	session.recordAnswer(false, { question: "食べる - Potential", expected: "食べられる", meaning: "eat" });

	const summary = session.endSession();
	assert.equal(summary.total, 2);
	assert.equal(summary.correct, 1);
	assert.equal(summary.incorrect, 1);
	assert.equal(summary.accuracy, 50);
	assert.equal(summary.mistakes.length, 1);

	const tsv = session.exportMistakesTSV();
	assert.ok(tsv.includes("食べる - Potential\t食べられる (eat)"));
});

test("syncManager payload export and apply", async () => {
	const { getLocalProgressPayload, applyProgressPayload } = await import("../src/engine/syncManager.js");
	// Mock localStorage
	globalThis.localStorage = {
		data: {},
		getItem(key) { return this.data[key] || null; },
		setItem(key, val) { this.data[key] = String(val); },
		removeItem(key) { delete this.data[key]; },
	};

	localStorage.setItem("settings", JSON.stringify({ streak: true }));
	localStorage.setItem("dojoSelectedLevel", "n3");

	const payload = getLocalProgressPayload();
	assert.equal(payload.dojoSelectedLevel, "n3");
	assert.equal(payload.settings.streak, true);

	payload.dojoSelectedLevel = "n2";
	localStorage.setItem("maxScoreObjectsV2", JSON.stringify({ 0: { score: 10 }, 1: { score: 5 } }));
	payload.maxScoreObjectsV2 = { 0: { score: 7 }, 1: { score: 12 }, 2: { score: 3 } };
	applyProgressPayload(payload);
	assert.equal(localStorage.getItem("dojoSelectedLevel"), "n2");

	const merged = JSON.parse(localStorage.getItem("maxScoreObjectsV2"));
	assert.equal(merged[0].score, 10); // kept higher local
	assert.equal(merged[1].score, 12); // took higher remote
	assert.equal(merged[2].score, 3);  // added new remote
});



