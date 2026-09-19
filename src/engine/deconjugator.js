import { CONJUGATION_TYPES } from "../constants.js";
import { getAllConjugations, toKanjiPlusHiragana } from "./conjugator.js";

// Readable grammatical descriptors (in French / bilingual for optimal study)
const FORM_DESCRIPTIONS_FR = {
	[CONJUGATION_TYPES.present]: "Présent",
	[CONJUGATION_TYPES.past]: "Passé",
	[CONJUGATION_TYPES.te]: "Forme en て (te-form)",
	[CONJUGATION_TYPES.volitional]: "Volitif (~よう / intention)",
	[CONJUGATION_TYPES.passive]: "Passif (~られる)",
	[CONJUGATION_TYPES.causative]: "Causatif (~させる / faire faire)",
	[CONJUGATION_TYPES.potential]: "Potentiel (~る/れる / pouvoir)",
	[CONJUGATION_TYPES.imperative]: "Impératif (~ろ / ordre)",
	[CONJUGATION_TYPES.causativePassive]: "Causatif-Passif (~させられる / subir)",
	[CONJUGATION_TYPES.ba]: "Conditionnel 〜ば (si...)",
	[CONJUGATION_TYPES.tara]: "Conditionnel 〜たら (quand / si...)",
	[CONJUGATION_TYPES.tai]: "Désiratif 〜たい (vouloir faire)",
	[CONJUGATION_TYPES.adverb]: "Adverbe (~く / ~に)",
};

function shuffle(array) {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export function formatConjugationLabel(wordJSON, conjugation) {
	const dictWord = toKanjiPlusHiragana(wordJSON.kanji);
	const formName = FORM_DESCRIPTIONS_FR[conjugation.type] || conjugation.type;
	
	let polarity = "";
	if (conjugation.affirmative === false) {
		polarity = "Négatif";
	} else if (conjugation.affirmative === true) {
		polarity = "Affirmatif";
	}

	let politeness = "";
	if (conjugation.polite === true) {
		politeness = "Poli (丁寧語)";
	} else if (conjugation.polite === false) {
		politeness = "Neutre (普通形)";
	}

	const parts = [dictWord, formName];
	const qualifiers = [polarity, politeness].filter(Boolean).join(" ");
	if (qualifiers) {
		parts.push(`[${qualifiers}]`);
	}
	return parts.join(" • ");
}

/**
 * Generate a Dokkai Flash recognition challenge
 * @param {Array} wordList List of word objects or wordJSONs
 * @returns {Object} Challenge with question, options (array of 4 labels), correctIndex (0-3), and word details
 */
export function generateDokkaiChallenge(wordList) {
	if (!wordList || wordList.length === 0) return null;

	// Pick a random word
	const wordItem = wordList[Math.floor(Math.random() * wordList.length)];
	const wordJSON = wordItem.wordJSON || wordItem;

	// Get all conjugations
	const allConjugations = getAllConjugations(wordJSON);
	if (allConjugations.length === 0) return null;

	// Filter out bare dictionary form if present
	let interestingConjugations = allConjugations.filter((c) => {
		if (c.type === CONJUGATION_TYPES.present && c.affirmative && !c.polite && wordJSON.type !== "na") {
			return false;
		}
		return c.validAnswers && c.validAnswers.length > 0;
	});

	if (interestingConjugations.length === 0) {
		interestingConjugations = allConjugations.filter((c) => c.validAnswers && c.validAnswers.length > 0);
	}
	if (interestingConjugations.length === 0) return null;

	const targetConjugation = interestingConjugations[
		Math.floor(Math.random() * interestingConjugations.length)
	];
	if (!targetConjugation || !targetConjugation.validAnswers || targetConjugation.validAnswers.length === 0) {
		return null;
	}

	// Pick one valid answer as the challenge prompt
	const answers = targetConjugation.validAnswers;
	const promptText = answers[Math.floor(Math.random() * answers.length)];

	const correctLabel = formatConjugationLabel(wordJSON, targetConjugation);

	// Generate plausible distractors
	// 1. Same word with other conjugations (excluding homographs that share the exact prompt text)
	const otherConjugationsSameWord = interestingConjugations.filter(
		(c) =>
			c !== targetConjugation &&
			formatConjugationLabel(wordJSON, c) !== correctLabel &&
			!(c.validAnswers && c.validAnswers.includes(promptText))
	);

	const distractorLabels = new Set();
	const shuffledSameWord = shuffle(otherConjugationsSameWord);

	for (const otherConj of shuffledSameWord) {
		const label = formatConjugationLabel(wordJSON, otherConj);
		if (label !== correctLabel) {
			distractorLabels.add(label);
		}
		if (distractorLabels.size >= 3) break;
	}

	// 2. If we need more distractors, pick from other words in the list
	if (distractorLabels.size < 3) {
		const otherWords = wordList.filter((w) => (w.wordJSON || w) !== wordJSON);
		const shuffledOtherWords = shuffle(otherWords);

		for (const otherW of shuffledOtherWords) {
			const otherJSON = otherW.wordJSON || otherW;
			const otherConjs = getAllConjugations(otherJSON);
			if (otherConjs.length > 0) {
				const randomOtherConj = otherConjs[Math.floor(Math.random() * otherConjs.length)];
				const label = formatConjugationLabel(otherJSON, randomOtherConj);
				if (
					label !== correctLabel &&
					!(randomOtherConj.validAnswers && randomOtherConj.validAnswers.includes(promptText))
				) {
					distractorLabels.add(label);
				}
			}
			if (distractorLabels.size >= 3) break;
		}
	}

	// 3. Fallback dummy labels if still < 3 distractors
	if (distractorLabels.size < 3) {
		const fallbackForms = [
			CONJUGATION_TYPES.past,
			CONJUGATION_TYPES.te,
			CONJUGATION_TYPES.potential,
			CONJUGATION_TYPES.passive,
			CONJUGATION_TYPES.causative,
			CONJUGATION_TYPES.volitional,
			CONJUGATION_TYPES.ba,
			CONJUGATION_TYPES.tara,
			CONJUGATION_TYPES.tai,
		];
		for (const type of fallbackForms) {
			const dummyLabel = `${toKanjiPlusHiragana(wordJSON.kanji)} • ${FORM_DESCRIPTIONS_FR[type] || type}`;
			if (dummyLabel !== correctLabel) {
				distractorLabels.add(dummyLabel);
			}
			if (distractorLabels.size >= 3) break;
		}
	}

	const allOptions = shuffle([correctLabel, ...Array.from(distractorLabels).slice(0, 3)]);
	const correctIndex = allOptions.indexOf(correctLabel);

	return {
		prompt: promptText,
		dictForm: toKanjiPlusHiragana(wordJSON.kanji),
		kanjiHtml: wordJSON.kanji,
		engMeaning: wordJSON.eng,
		correctLabel,
		correctIndex,
		options: allOptions,
		conjugation: targetConjugation,
		wordJSON,
	};
}
