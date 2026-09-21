import { CONJUGATION_TYPES, PARTS_OF_SPEECH } from "../constants.js";

export const BUNPRO_BASE_URL = "https://bunpro.jp";

/**
 * URLs officielles des leçons Bunpro (en français).
 */
export const BUNPRO_LESSONS = Object.freeze({
	// Formes polies de verbes (ます, ました, ません...)
	politeVerbEndings: `${BUNPRO_BASE_URL}/fr/grammar_points/polite-verb-endings`,

	// Verbes - Présent / Dictionnaire
	verbNonPast: `${BUNPRO_BASE_URL}/fr/grammar_points/verb-non-past`,
	verbRuDict: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%82%8B-Verbs`,
	verbUDict: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%86-Verbs`,

	// Verbes - Négatif présent (~ない)
	verbRuNeg: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%82%8Bverb-%E3%81%AA%E3%81%84`,
	verbUNeg: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%86verb--%E3%81%AA%E3%81%84`,

	// Verbes - Passé (~た)
	verbRuPast: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%82%8B-verb-past`,
	verbUPast: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%86-verb-past`,

	// Verbes - Négatif passé (~なかった)
	verbRuNegPast: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%82%8B-verb-neg-past`,
	verbUNegPast: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%86-verb-neg-past`,

	// Verbes - Forme en て
	verbTe: `${BUNPRO_BASE_URL}/fr/grammar_points/verb-%E3%81%A6`,

	// Volitif
	volitionalPlain: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%82%88%E3%81%86-%E3%81%8A%E3%81%86`,
	volitionalPolite: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%BE%E3%81%97%E3%82%87%E3%81%86`,

	// Modes avancés
	potential: `${BUNPRO_BASE_URL}/fr/grammar_points/Verb[potential]`,
	passive: `${BUNPRO_BASE_URL}/fr/grammar_points/Verb[passive]`,
	causative: `${BUNPRO_BASE_URL}/fr/grammar_points/causative`,
	causativePassive: `${BUNPRO_BASE_URL}/fr/grammar_points/causative-passive`,
	imperative: `${BUNPRO_BASE_URL}/fr/grammar_points/%E5%91%BD%E4%BB%A4%E5%BD%A2`,

	// Conditionnels & Désiratif
	ba: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%B0`,
	tara: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%9F%E3%82%89`,
	tai: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%9F%E3%81%84`,

	// Adverbes
	adverb: `${BUNPRO_BASE_URL}/fr/grammar_points/describing-verbs`,

	// Adjectifs - い
	adjI: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%84-adjectives`,
	adjINeg: `${BUNPRO_BASE_URL}/fr/grammar_points/negative-%E3%81%84-adjectives`,
	adjIPast: `${BUNPRO_BASE_URL}/fr/grammar_points/past-tense-%E3%81%84-adjectives`,
	adjINegPast: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%84-Adjective-%E3%81%8F%E3%81%AA%E3%81%8B%E3%81%A3%E3%81%9F`,
	adjITe: `${BUNPRO_BASE_URL}/fr/grammar_points/adjective-%E3%81%A6-noun-%E3%81%A7`,

	// Adjectifs - な
	adjNa: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%AA-adjectives`,
	adjNaNeg: `${BUNPRO_BASE_URL}/fr/grammar_points/%E3%81%98%E3%82%83%E3%81%AA%E3%81%84`,
});

/**
 * Renvoie l'URL de la leçon Bunpro la plus adaptée pour une conjugaison donnée.
 *
 * @param {Object} conjugation - Objet de conjugaison (contient type, affirmative, polite)
 * @param {Object} [wordJSON] - Informations sur le mot (contient type : 'u', 'ru', 'irv', 'ira', 'i', 'na')
 * @returns {string | null} URL complète de la leçon Bunpro ou null
 */
export function getBunproLessonUrl(conjugation, wordJSON = null) {
	if (!conjugation || !conjugation.type) {
		return null;
	}

	const isNegative = conjugation.affirmative === false;
	const isPolite = conjugation.polite === true;
	const wordType = wordJSON?.type;
	const isAdjective = wordType === "i" || wordType === "na" || wordType === "ira";

	switch (conjugation.type) {
		case CONJUGATION_TYPES.present: {
			if (isAdjective) {
				if (wordType === "na") {
					return isNegative ? BUNPRO_LESSONS.adjNaNeg : BUNPRO_LESSONS.adjNa;
				}
				// い-adjectifs ou adjectifs irréguliers (いい)
				return isNegative ? BUNPRO_LESSONS.adjINeg : BUNPRO_LESSONS.adjI;
			}

			// Verbes
			if (isPolite) {
				return BUNPRO_LESSONS.politeVerbEndings;
			}
			if (isNegative) {
				if (wordType === "ru") return BUNPRO_LESSONS.verbRuNeg;
				if (wordType === "u") return BUNPRO_LESSONS.verbUNeg;
				return BUNPRO_LESSONS.verbNonPast;
			}
			// Affirmatif neutre
			if (wordType === "ru") return BUNPRO_LESSONS.verbRuDict;
			if (wordType === "u") return BUNPRO_LESSONS.verbUDict;
			return BUNPRO_LESSONS.verbNonPast;
		}

		case CONJUGATION_TYPES.past: {
			if (isAdjective) {
				if (wordType === "na") {
					return BUNPRO_LESSONS.adjNa;
				}
				return isNegative ? BUNPRO_LESSONS.adjINegPast : BUNPRO_LESSONS.adjIPast;
			}

			// Verbes
			if (isPolite) {
				return BUNPRO_LESSONS.politeVerbEndings;
			}
			if (isNegative) {
				if (wordType === "ru") return BUNPRO_LESSONS.verbRuNegPast;
				if (wordType === "u") return BUNPRO_LESSONS.verbUNegPast;
				return BUNPRO_LESSONS.verbRuNegPast;
			}
			// Affirmatif neutre
			if (wordType === "ru") return BUNPRO_LESSONS.verbRuPast;
			if (wordType === "u") return BUNPRO_LESSONS.verbUPast;
			return BUNPRO_LESSONS.verbRuPast;
		}

		case CONJUGATION_TYPES.te: {
			if (isAdjective) {
				return BUNPRO_LESSONS.adjITe;
			}
			return BUNPRO_LESSONS.verbTe;
		}

		case CONJUGATION_TYPES.volitional: {
			return isPolite ? BUNPRO_LESSONS.volitionalPolite : BUNPRO_LESSONS.volitionalPlain;
		}

		case CONJUGATION_TYPES.passive: {
			return BUNPRO_LESSONS.passive;
		}

		case CONJUGATION_TYPES.causative: {
			return BUNPRO_LESSONS.causative;
		}

		case CONJUGATION_TYPES.causativePassive: {
			return BUNPRO_LESSONS.causativePassive;
		}

		case CONJUGATION_TYPES.potential: {
			return BUNPRO_LESSONS.potential;
		}

		case CONJUGATION_TYPES.imperative: {
			return BUNPRO_LESSONS.imperative;
		}

		case CONJUGATION_TYPES.ba: {
			return BUNPRO_LESSONS.ba;
		}

		case CONJUGATION_TYPES.tara: {
			return BUNPRO_LESSONS.tara;
		}

		case CONJUGATION_TYPES.tai: {
			return BUNPRO_LESSONS.tai;
		}

		case CONJUGATION_TYPES.adverb: {
			return BUNPRO_LESSONS.adverb;
		}

		default:
			return null;
	}
}
