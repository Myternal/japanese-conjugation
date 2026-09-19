// Word selection, probability management, and queue weighting algorithms
import { getAllConjugations } from "./conjugator.js";

export class Word {
	constructor(wordJSON, conjugation) {
		this.wordJSON = wordJSON;
		this.conjugation = conjugation;
		this.probability = 0;
		this.wasRecentlyIncorrect = false;
	}
}

export class WordRecentlySeen {
	constructor(word, wasCorrect) {
		this.word = word;
		this.wasCorrect = wasCorrect;
	}
}

export function findMinProb(currentWords) {
	let min = Infinity;
	for (let i = 0; i < currentWords.length; i++) {
		if (currentWords[i].probability < min && currentWords[i].probability !== 0) {
			min = currentWords[i].probability;
		}
	}
	return min === Infinity ? 0 : min;
}

export function normalizeProbabilities(currentWords) {
	let totalProbability = 0;
	for (let i = 0; i < currentWords.length; i++) {
		totalProbability += currentWords[i].probability;
	}
	if (totalProbability > 0) {
		for (let i = 0; i < currentWords.length; i++) {
			currentWords[i].probability /= totalProbability;
		}
	} else if (currentWords.length > 0) {
		// Ultimate safety: if all probabilities are 0, recover gracefully by equalizing
		equalizeProbabilities(currentWords);
	}
}

export function setAllProbabilitiesToValue(currentWords, value) {
	for (let i = 0; i < currentWords.length; i++) {
		currentWords[i].probability = value;
	}
}

export function equalizeProbabilities(currentWords) {
	setAllProbabilitiesToValue(currentWords, 1);
	normalizeProbabilities(currentWords);
}

export function updateProbabilities(currentWords, wordsRecentlySeenQueue, currentWord, currentWordWasCorrect) {
	const roundsToWait = 2;

	if (currentWords.length < roundsToWait + 1) {
		setAllProbabilitiesToValue(currentWords, 1);
		currentWord.probability = 0;
		normalizeProbabilities(currentWords);
		return;
	}

	if (currentWord.wordJSON.group) {
		const currentConjugation = currentWord.conjugation;
		const group = currentWord.wordJSON.group;

		currentWords
			.filter((word) => {
				const conjugation = word.conjugation;
				return (
					word.wordJSON.group === group &&
					word !== currentWord &&
					conjugation.type === currentConjugation.type &&
					conjugation.affirmative === currentConjugation.affirmative &&
					conjugation.polite === currentConjugation.polite
				);
			})
			.forEach((word) => {
				word.probability /= 3;
			});
	}

	if (wordsRecentlySeenQueue.length >= roundsToWait) {
		const dequeuedWord = wordsRecentlySeenQueue.shift();
		const rawMinProb = findMinProb(currentWords);
		const baselineProb = 1 / Math.max(currentWords.length, 1);
		const currentMinProb = rawMinProb > 0 ? rawMinProb : baselineProb;
		const correctProbModifier = 0.5;
		const incorrectProbModifier = 0.85;

		let newProbability;
		if (dequeuedWord.wasCorrect && !dequeuedWord.word.wasRecentlyIncorrect) {
			newProbability = currentMinProb * correctProbModifier;
		} else if (dequeuedWord.wasCorrect && dequeuedWord.word.wasRecentlyIncorrect) {
			newProbability = currentMinProb * incorrectProbModifier;
			dequeuedWord.word.wasRecentlyIncorrect = false;
		} else if (!dequeuedWord.wasCorrect) {
			newProbability = 10;
		}
		dequeuedWord.word.probability = newProbability;
	}

	if (!currentWordWasCorrect) {
		currentWord.wasRecentlyIncorrect = true;
	}

	wordsRecentlySeenQueue.push(new WordRecentlySeen(currentWord, currentWordWasCorrect));
	currentWord.probability = 0;
	normalizeProbabilities(currentWords);
}

export function createWordList(JSONWords) {
	const wordList = {};
	for (const [key, value] of Object.entries(JSONWords)) {
		wordList[key] = [];
		for (let i = 0; i < value.length; i++) {
			const conjugations = getAllConjugations(value[i]);
			for (let j = 0; j < conjugations.length; j++) {
				wordList[key].push(new Word(value[i], conjugations[j]));
			}
		}
	}
	return wordList;
}

export function pickRandomWord(wordList) {
	if (!wordList || wordList.length === 0) return null;
	let random = Math.random();
	try {
		for (let i = 0; i < wordList.length; i++) {
			if (wordList[i].probability <= 0) continue;
			if (random < wordList[i].probability) {
				return wordList[i];
			}
			random -= wordList[i].probability;
		}
		for (let i = wordList.length - 1; i >= 0; i--) {
			if (wordList[i].probability > 0) return wordList[i];
		}
		return wordList[0];
	} catch (err) {
		return wordList[0];
	}
}

// Backward compatibility alias
export const updateProbabilites = updateProbabilities;
