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

test("generateDokkaiChallenge handles minimal 1-word list and fallback distractors", async () => {
	const { generateDokkaiChallenge } = await import("../src/engine/deconjugator.js");
	const singleWordList = [
		{ kanji: "<ruby>話<rt>はな</rt></ruby>す", type: "u", eng: "speak" }
	];
	const challenge = generateDokkaiChallenge(singleWordList);
	assert.ok(challenge != null);
	assert.equal(challenge.options.length, 4);
	assert.ok(challenge.correctIndex >= 0 && challenge.correctIndex < 4);
	assert.equal(challenge.options[challenge.correctIndex], challenge.correctLabel);
});

test("syncManager UTF-8 Base64 roundtrip with Japanese characters", async () => {
	const { generateSyncUrl, checkUrlForSyncImport } = await import("../src/engine/syncManager.js");
	globalThis.window = {
		location: {
			origin: "http://localhost:1234",
			pathname: "/",
			search: "",
			hash: "",
		},
	};
	globalThis.document = { title: "Dojo Réflexe" };
	globalThis.history = {
		replaceState(_state, _title, _url) {},
	};

	localStorage.setItem("dojoCustomVocab", JSON.stringify([{ kanji: "飲む", eng: "boire" }]));
	const url = generateSyncUrl();
	assert.ok(url.includes("#sync="));

	const hashPart = url.substring(url.indexOf("#"));
	globalThis.window.location.hash = hashPart;

	const imported = checkUrlForSyncImport();
	assert.ok(imported != null);
	assert.equal(imported.dojoCustomVocab[0].kanji, "飲む");
});

test("toHiragana correctly converts multi-character ruby blocks", async () => {
	const { toHiragana } = await import("../src/engine/conjugator.js");
	assert.equal(toHiragana("<ruby>勉強<rt>べんきょう</rt></ruby>する"), "べんきょうする");
	assert.equal(toHiragana("<ruby>食<rt>た</rt></ruby>べる"), "たべる");
	assert.equal(toHiragana("<ruby>持<rt>も</rt></ruby>って<ruby>行<rt>い</rt></ruby>く"), "もっていく");
});

test("SessionManager pauseSprint and resumeSprint preserve remaining time", async () => {
	const { SessionManager, GAME_MODES } = await import("../src/engine/gameModes.js");
	let tickRecorded = 0;
	const session = new SessionManager({
		onTick: (secs) => { tickRecorded = secs; },
	});
	session.setMode(GAME_MODES.SPRINT, 60);
	session.startSprint();
	session.timeRemaining = 42;
	session.pauseSprint();

	assert.equal(session.timerInterval, null);
	assert.equal(session.timeRemaining, 42);

	session.resumeSprint();
	assert.ok(session.timerInterval != null);
	assert.equal(session.timeRemaining, 42);
	assert.equal(tickRecorded, 42);
	session.stopTimer();
});

test("parseCustomWordList handles Anki bracket syntax and auto-matches known words", async () => {
	const { parseCustomWordList } = await import("../src/data/vocabData.js");

	// 1. Anki bracket syntax
	const bracketResult = parseCustomWordList("落[お]とす\tdrop something");
	assert.equal(bracketResult.length, 1);
	assert.equal(bracketResult[0].kanji, "<ruby>落<rt>お</rt></ruby>とす");
	assert.equal(bracketResult[0].type, "u");
	assert.equal(bracketResult[0].eng, "drop something");

	// 2. Known dictionary word in plain text auto-matches full ruby tags and meaning
	const knownResult = parseCustomWordList("食べる");
	assert.equal(knownResult.length, 1);
	assert.equal(knownResult[0].kanji, "<ruby>食<rt>た</rt></ruby>べる");
	assert.equal(knownResult[0].type, "ru");
	assert.equal(knownResult[0].eng, "eat");

	// 3. Unknown verb heuristic deduction
	const customResult = parseCustomWordList("泳ぎ回る\tswim around");
	assert.equal(customResult.length, 1);
	assert.equal(customResult[0].type, "u");
	assert.equal(customResult[0].eng, "swim around");
});

test("getAllConjugations produces deduplicated validAnswers", () => {
	// Word with no kanji
	const kirei = { kanji: "きれい", type: "na", eng: "beautiful" };
	const conjs = getAllConjugations(kirei);
	assert.ok(conjs.length > 0);
	for (const conj of conjs) {
		const uniqueAnswers = Array.from(new Set(conj.validAnswers));
		assert.equal(
			conj.validAnswers.length,
			uniqueAnswers.length,
			`Found duplicate answers in conjugation ${conj.type} for ${kirei.kanji}: ${JSON.stringify(conj.validAnswers)}`
		);
	}

	// Irregular verb する
	const suru = { kanji: "する", type: "irv", eng: "do" };
	const suruConjs = getAllConjugations(suru);
	for (const conj of suruConjs) {
		const unique = Array.from(new Set(conj.validAnswers));
		assert.equal(conj.validAnswers.length, unique.length);
	}
});

test("Adjective conditional ba and tara forms", () => {
	const vf = conjugationFunctions[PARTS_OF_SPEECH.adjective];
	// i-adjective
	assert.equal(vf[CONJUGATION_TYPES.ba]("高い", "i", true, false), "高ければ");
	assert.deepEqual(vf[CONJUGATION_TYPES.ba]("高い", "i", false, false), ["高くなければ", "高くなきゃ"]);
	assert.equal(vf[CONJUGATION_TYPES.tara]("高い", "i", true, false), "高かったら");
	assert.equal(vf[CONJUGATION_TYPES.tara]("高い", "i", false, false), "高くなかったら");

	// na-adjective
	assert.deepEqual(vf[CONJUGATION_TYPES.ba]("静か", "na", true, false), ["静かなら", "静かならば", "静かであれば"]);
	assert.deepEqual(vf[CONJUGATION_TYPES.ba]("静か", "na", false, false), ["静かじゃなければ", "静かでなければ", "静かではなければ"]);

	// na-adjective tara polite vs plain
	assert.deepEqual(vf[CONJUGATION_TYPES.tara]("静か", "na", true, true), ["静かでしたら"]);
	assert.deepEqual(vf[CONJUGATION_TYPES.tara]("静か", "na", true, false), ["静かだったら"]);
	assert.deepEqual(vf[CONJUGATION_TYPES.tara]("静か", "na", false, true), [
		"静かじゃありませんでしたら",
		"静かではありませんでしたら",
	]);
	assert.deepEqual(vf[CONJUGATION_TYPES.tara]("静か", "na", false, false), [
		"静かじゃなかったら",
		"静かではなかったら",
	]);
});

test("持っていく is accepted via altOkurigana in getAllConjugations", async () => {
	const { wordData } = await import("../src/wordData.js");
	const motteiku = wordData.verbs.find(
		(v) => v.kanji.includes("持") && v.kanji.includes("行")
	);
	assert.ok(motteiku != null);
	assert.ok(motteiku.altOkurigana?.includes("持っていく"));

	const conjs = getAllConjugations(motteiku);
	const pastPlain = conjs.find(
		(c) => c.type === CONJUGATION_TYPES.past && c.affirmative && !c.polite
	);
	assert.ok(pastPlain.validAnswers.includes("持っていった"));
	assert.ok(pastPlain.validAnswers.includes("持って行った"));
});

test("generateDokkaiChallenge avoids homograph distractors", async () => {
	const { generateDokkaiChallenge } = await import("../src/engine/deconjugator.js");
	const taberuList = [
		{ kanji: "<ruby>食<rt>た</rt></ruby>べる", type: "ru", eng: "eat" },
	];

	// Run multiple times to verify no challenge has options sharing the prompt text
	for (let i = 0; i < 20; i++) {
		const challenge = generateDokkaiChallenge(taberuList);
		assert.ok(challenge != null);
		assert.equal(challenge.options.length, 4);
		assert.ok(challenge.correctIndex >= 0 && challenge.correctIndex < 4);

		// If prompt is 食べられる, neither passive nor potential should be in the other options
		// Distractors must not include homographs
		const otherOptions = challenge.options.filter((_, idx) => idx !== challenge.correctIndex);
		assert.ok(!otherOptions.includes(challenge.correctLabel));
	}
});

test("parseCustomWordList recognizes words entered in hiragana", async () => {
	const { parseCustomWordList } = await import("../src/data/vocabData.js");
	const res = parseCustomWordList("たべる\tto eat\nのむ");
	assert.equal(res.length, 2);
	assert.equal(res[0].kanji, "<ruby>食<rt>た</rt></ruby>べる");
	assert.equal(res[0].type, "ru");
	assert.equal(res[1].kanji, "<ruby>飲<rt>の</rt></ruby>む");
	assert.equal(res[1].type, "u");

	const resIi = parseCustomWordList("良い");
	assert.equal(resIi[0].type, "ira");

	// Na-adjective with trailing な
	const resNa = parseCustomWordList("静かな, 便利な");
	assert.equal(resNa[0].type, "na");
	assert.equal(resNa[0].kanji, "<ruby>静<rt>しず</rt></ruby>か");
	assert.equal(resNa[1].type, "na");
	assert.equal(resNa[1].kanji, "便利");

	// Compound verb ending with 行く/いく
	const resIku = parseCustomWordList("連れて行く, つれていく");
	assert.equal(resIku[0].type, "irv");
	assert.equal(resIku[0].group, "iku");
	assert.equal(resIku[1].type, "irv");
	assert.equal(resIku[1].group, "iku");

	// Known word preserves group & altOkurigana
	const resMotteiku = parseCustomWordList("持って行く");
	assert.equal(resMotteiku[0].group, "iku");
	assert.deepEqual(resMotteiku[0].altOkurigana, ["持っていく"]);
});

test("parseCustomWordList supports Japanese punctuation 、 and ；", async () => {
	const { parseCustomWordList } = await import("../src/data/vocabData.js");
	const res = parseCustomWordList("食べる、飲む；行く");
	assert.equal(res.length, 3);
	assert.equal(res[0].kanji, "<ruby>食<rt>た</rt></ruby>べる");
	assert.equal(res[1].kanji, "<ruby>飲<rt>の</rt></ruby>む");
	assert.equal(res[2].kanji, "<ruby>行<rt>い</rt></ruby>く");
});

test("EXTENDED_JLPT_VOCAB.n5 contains na-adjectives and all verb types", async () => {
	const { EXTENDED_JLPT_VOCAB, getVocabObjectForLevel } = await import("../src/data/vocabData.js");
	const n5List = EXTENDED_JLPT_VOCAB.n5;

	// Must contain na-adjectives
	const naAdjs = n5List.filter((item) => item.type === "na");
	assert.ok(naAdjs.length > 0, "N5 must contain at least one na-adjective");
	assert.ok(naAdjs.some((a) => a.kanji.includes("静") || a.kanji.includes("好") || a.kanji === "きれい"));

	// Must contain i-adjectives and irregular adjectives
	const iAdjs = n5List.filter((item) => item.type === "i");
	const iraAdjs = n5List.filter((item) => item.type === "ira");
	assert.ok(iAdjs.length > 0, "N5 must contain i-adjectives");
	assert.ok(iraAdjs.length > 0, "N5 must contain ira-adjectives (like いい)");

	// Must contain u, ru, and irv verbs
	const uVerbs = n5List.filter((item) => item.type === "u");
	const ruVerbs = n5List.filter((item) => item.type === "ru");
	const irvVerbs = n5List.filter((item) => item.type === "irv");
	assert.ok(uVerbs.length > 0, "N5 must contain u-verbs");
	assert.ok(uVerbs.some((v) => v.kanji.includes("飲")), "N5 must contain 飲む");
	assert.ok(ruVerbs.length > 0, "N5 must contain ru-verbs");
	assert.ok(irvVerbs.length > 0, "N5 must contain irv-verbs");

	// Formatting as words object preserves both verbs and adjectives
	const n5Obj = getVocabObjectForLevel("n5");
	assert.ok(n5Obj.verbs.length > 0);
	assert.ok(n5Obj.adjectives.length > 0);
	assert.ok(n5Obj.adjectives.some((a) => a.type === "na"));
});

test("escapeHtml sanitizes untrusted input", async () => {
	const { escapeHtml } = await import("../src/utils.js");
	assert.equal(escapeHtml("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
	assert.equal(escapeHtml('foo & "bar"'), "foo &amp; &quot;bar&quot;");
	assert.equal(escapeHtml(""), "");
	assert.equal(escapeHtml(null), "");
});

test("Irregular adjectives 良い and 格好いい/格好良い produce full valid conjugations", async () => {
	const yoiWord = { kanji: "良い", type: "ira", eng: "good" };
	const yoiConjs = getAllConjugations(yoiWord);
	assert.ok(yoiConjs.length >= 10, "良い must produce all standard conjugations");
	const pastPlain = yoiConjs.find(
		(c) => c.type === CONJUGATION_TYPES.past && c.affirmative && !c.polite
	);
	assert.ok(pastPlain.validAnswers.includes("よかった"));
	assert.ok(pastPlain.validAnswers.includes("良かった"));

	const kakkoiiWord = { kanji: "格好いい", type: "ira", eng: "cool" };
	const kakkoiiConjs = getAllConjugations(kakkoiiWord);
	assert.ok(kakkoiiConjs.length >= 10, "格好いい must produce all standard conjugations");
	const kakkoiiPast = kakkoiiConjs.find(
		(c) => c.type === CONJUGATION_TYPES.past && c.affirmative && !c.polite
	);
	assert.ok(kakkoiiPast.validAnswers.some((a) => a.includes("格好") || a.includes("かっこ")));
});

test("SessionManager caps outlier reaction times for session average", async () => {
	const { SessionManager, GAME_MODES } = await import("../src/engine/gameModes.js");
	const session = new SessionManager();
	session.setMode(GAME_MODES.CLASSIC);

	// Simulate a 120s idle answer
	session.questionStartTime = performance.now() - 120000;
	session.recordAnswer(true, { question: "test", expected: "test" });

	const summary = session.endSession();
	assert.ok(summary.avgSpeedMs <= 15000, `avgSpeedMs should be capped at 15000ms, got ${summary.avgSpeedMs}`);
});

test("exportMistakesTSV omits empty parentheses when meaning is missing", async () => {
	const { SessionManager } = await import("../src/engine/gameModes.js");
	const session = new SessionManager();
	session.recordAnswer(false, { question: "食べる - Past", expected: "食べた", meaning: "" });
	const tsv = session.exportMistakesTSV();
	assert.equal(tsv, "食べる - Past\t食べた");
});

test("sanitizeRubyHtml sanitizes untrusted input while rendering valid ruby blocks", async () => {
	const { sanitizeRubyHtml } = await import("../src/utils.js");
	// Valid ruby
	assert.equal(
		sanitizeRubyHtml("<ruby>食<rt>た</rt></ruby>べる"),
		'<ruby>食<span class="rt">た</span></ruby>べる'
	);
	// Malicious script injection outside ruby
	assert.equal(
		sanitizeRubyHtml("<script>alert('xss')</script>食べる"),
		"&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;食べる"
	);
	// Malicious img injection outside ruby
	assert.equal(
		sanitizeRubyHtml('<img src=x onerror="alert(1)">'),
		"&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
	);
	// Malicious injection inside ruby tag
	assert.equal(
		sanitizeRubyHtml("<ruby><script>alert(1)</script><rt>bad</rt></ruby>"),
		'<ruby>alert(1)<span class="rt">bad</span></ruby>'
	);
	// Plain word without ruby
	assert.equal(sanitizeRubyHtml("きれい"), "きれい");
	assert.equal(sanitizeRubyHtml(""), "");
	assert.equal(sanitizeRubyHtml(null), "");
});

test("parseCustomWordList correctly identifies irregular adjectives like 格好いい, 格好良い, 気持ちいい", async () => {
	const { parseCustomWordList } = await import("../src/data/vocabData.js");
	const words = parseCustomWordList("格好いい\tcool\n格好良い\n気持ちいい\tfeel good");
	assert.equal(words.length, 3);
	for (const w of words) {
		assert.equal(w.type, "ira", `Expected ${w.kanji} to be type 'ira', got ${w.type}`);
		const conjs = getAllConjugations(w);
		const pastPlain = conjs.find(
			(c) => c.type === CONJUGATION_TYPES.past && c.affirmative && !c.polite
		);
		assert.ok(pastPlain != null, `Past plain must exist for ${w.kanji}`);
		assert.ok(
			pastPlain.validAnswers.some((a) => a.includes("よかった") || a.includes("良かった")),
			`Past plain for ${w.kanji} must contain よかった/良かった, got ${JSON.stringify(pastPlain.validAnswers)}`
		);
		assert.ok(
			!pastPlain.validAnswers.some((a) => a.includes("いかった")),
			`Past plain for ${w.kanji} must not contain invalid form 'いかった'`
		);
	}
});

test("checkSuffix handles short inputs gracefully without error", async () => {
	const { checkSuffix } = await import("../src/engine/conjugator.js");
	assert.equal(checkSuffix("く", "いく"), false);
	assert.equal(checkSuffix("", "いく"), false);
	assert.equal(checkSuffix(null, "いく"), false);
	assert.equal(checkSuffix("持っていく", "いく"), "持って");
});



