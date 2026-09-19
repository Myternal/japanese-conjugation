import test from "node:test";
import assert from "node:assert/strict";

import {
	Word,
	WordRecentlySeen,
	findMinProb,
	normalizeProbabilities,
	setAllProbabilitiesToValue,
	equalizeProbabilities,
	updateProbabilities,
	createWordList,
	pickRandomWord,
} from "../src/engine/wordSelector.js";

test("equalizeProbabilities and normalizeProbabilities", () => {
	const words = [
		new Word({ word: "食べる" }, {}),
		new Word({ word: "飲む" }, {}),
		new Word({ word: "行く" }, {}),
		new Word({ word: "来る" }, {}),
	];

	equalizeProbabilities(words);

	assert.equal(words.length, 4);
	for (const w of words) {
		assert.equal(w.probability, 0.25);
	}

	const sum = words.reduce((acc, w) => acc + w.probability, 0);
	assert(Math.abs(sum - 1.0) < 1e-9);
});

test("findMinProb ignores zero probabilities and handles all zeroes", () => {
	const words = [
		{ probability: 0 },
		{ probability: 0.5 },
		{ probability: 0.15 },
		{ probability: 0.35 },
	];
	const min = findMinProb(words);
	assert.equal(min, 0.15);

	const allZero = [{ probability: 0 }, { probability: 0 }];
	assert.equal(findMinProb(allZero), 0);
});

test("pickRandomWord returns an element from the list or null when empty", () => {
	assert.equal(pickRandomWord([]), null);
	assert.equal(pickRandomWord(null), null);

	const words = [
		new Word({ word: "食べる" }, {}),
		new Word({ word: "飲む" }, {}),
	];
	equalizeProbabilities(words);

	const picked = pickRandomWord(words);
	assert(picked === words[0] || picked === words[1]);
});

test("updateProbabilities weights queue and updates probabilities", () => {
	const words = [
		new Word({ word: "食べる", group: "ru" }, { type: "present", affirmative: true, polite: false }),
		new Word({ word: "見る", group: "ru" }, { type: "present", affirmative: true, polite: false }),
		new Word({ word: "飲む", group: "u" }, { type: "present", affirmative: true, polite: false }),
		new Word({ word: "話す", group: "u" }, { type: "present", affirmative: true, polite: false }),
	];
	equalizeProbabilities(words);

	const queue = [];
	const current = words[0];

	// Round 1: answered correctly
	updateProbabilities(words, queue, current, true);

	// Current word probability must be 0 immediately after being answered
	assert.equal(current.probability, 0);
	assert.equal(queue.length, 1);
	assert.equal(queue[0].word, current);
	assert.equal(queue[0].wasCorrect, true);

	// Probabilities must remain normalized to 1
	const sum1 = words.reduce((acc, w) => acc + w.probability, 0);
	assert(Math.abs(sum1 - 1.0) < 1e-9);

	// Round 2: next word answered incorrectly
	const next = words[1];
	updateProbabilities(words, queue, next, false);
	assert.equal(next.probability, 0);
	assert.equal(next.wasRecentlyIncorrect, true);
	assert.equal(queue.length, 2);

	// Round 3: next word answered correctly - should dequeue words[0] and give it low prob
	const third = words[2];
	updateProbabilities(words, queue, third, true);

	// words[0] was dequeued and received its new probability
	assert(words[0].probability > 0);
	assert.equal(queue.length, 2);

	const sum3 = words.reduce((acc, w) => acc + w.probability, 0);
	assert(Math.abs(sum3 - 1.0) < 1e-9);
});

test("createWordList instantiates Word objects with conjugations", () => {
	const sampleWords = {
		u: [
			{
				kanji: "飲[の]む",
				meaning: "to drink",
				group: "u",
			},
		],
	};

	const wordList = createWordList(sampleWords);
	assert(wordList.u);
	assert(wordList.u.length > 0);
	assert.equal(wordList.u[0].wordJSON.kanji, "飲[の]む");
	assert(wordList.u[0].conjugation.type);
});

test("3-word list never collapses probabilities to zero across multiple rounds", () => {
	const words = [
		new Word({ kanji: "飲む", group: "u" }, { type: "present", affirmative: true, polite: false }),
		new Word({ kanji: "食べる", group: "ru" }, { type: "present", affirmative: true, polite: false }),
		new Word({ kanji: "行く", group: "irv" }, { type: "present", affirmative: true, polite: false }),
	];
	equalizeProbabilities(words);
	const queue = [];

	for (let round = 0; round < 6; round++) {
		const currentWord = words[round % words.length];
		updateProbabilities(words, queue, currentWord, true);

		// Check that probabilities are not all zero and sum to 1
		const totalProb = words.reduce((acc, w) => acc + w.probability, 0);
		assert(Math.abs(totalProb - 1.0) < 1e-6, `Total prob at round ${round} is ${totalProb}`);
		assert(words.some((w) => w.probability > 0), `At least one word must have prob > 0 at round ${round}`);
		const picked = pickRandomWord(words);
		assert.ok(picked != null, `pickRandomWord returned null at round ${round}`);
	}
});

test("pickRandomWord never returns a 0-probability item on boundary random values", () => {
	const words = [
		{ word: "A", probability: 0 },
		{ word: "B", probability: 0.5 },
		{ word: "C", probability: 0.5 },
	];
	const originalRandom = Math.random;
	try {
		// Mock random to simulate floating point fallthrough
		Math.random = () => 0.9999999;
		const picked = pickRandomWord(words);
		assert.notEqual(picked.probability, 0);
		assert.equal(picked.word, "C");
	} finally {
		Math.random = originalRandom;
	}
});

