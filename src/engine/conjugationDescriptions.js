import { CONJUGATION_TYPES } from "../constants.js";

/**
 * Pédagogie des modes et formes verbales japonaises (en français).
 */
export const CONJUGATION_DESCRIPTIONS = Object.freeze({
	[CONJUGATION_TYPES.present]: {
		name: "Présent",
		affirmative: "Action habituelle, état actuel ou futur",
		negative: "Ne pas faire l'action (habitude, état ou futur)",
		tooltip: "Présent / Futur : habitude, vérité générale ou futur",
	},
	[CONJUGATION_TYPES.past]: {
		name: "Passé",
		affirmative: "Action achevée ou état passé",
		negative: "Action non réalisée dans le passé",
		tooltip: "Passé : action terminée ou état révolu",
	},
	[CONJUGATION_TYPES.te]: {
		name: "Forme en 〜て",
		affirmative: "Liaison d'actions, action en cours (~ている) ou requête (~てください)",
		negative: "Sans faire / ne faisant pas (~なくて)",
		tooltip: "Forme en て : liaison, continu ou demande polie",
	},
	[CONJUGATION_TYPES.volitional]: {
		name: "Volitionnel",
		affirmative: "Intention (« je vais... ») ou suggestion collective (« faisons... ! »)",
		negative: "Intention de ne pas faire",
		tooltip: "Volitionnel / Volitif : intention personnelle ou invitation à faire",
	},
	[CONJUGATION_TYPES.passive]: {
		name: "Passif",
		affirmative: "Subir l'action (« être [fait] ») ou passif de gêne / nuisance",
		negative: "Ne pas subir l'action / ne pas être [fait]",
		tooltip: "Passif : subir l'action ou être affecté par un événement",
	},
	[CONJUGATION_TYPES.causative]: {
		name: "Causatif",
		affirmative: "Faire faire ou laisser faire une action à quelqu'un",
		negative: "Ne pas faire faire / ne pas laisser faire à quelqu'un",
		tooltip: "Causatif : faire faire ou laisser faire (faire manger, laisser sortir...)",
	},
	[CONJUGATION_TYPES.causativePassive]: {
		name: "Causatif-Passif",
		affirmative: "Être forcé ou contraint de faire une action malgré soi",
		negative: "Ne pas être forcé de faire l'action",
		tooltip: "Causatif-Passif : contrainte (être forcé d'agir contre son gré)",
	},
	[CONJUGATION_TYPES.potential]: {
		name: "Potentiel",
		affirmative: "Capacité ou possibilité (« pouvoir faire / être capable de »)",
		negative: "Incapacité ou impossibilité (« ne pas pouvoir faire »)",
		tooltip: "Potentiel : capacité ou possibilité physique de réaliser l'action",
	},
	[CONJUGATION_TYPES.imperative]: {
		name: "Impératif",
		affirmative: "Ordre direct ou consigne ferme (« fais ! »)",
		negative: "Interdiction directe (« ne fais pas ! »)",
		tooltip: "Impératif : ordre direct ou consigne énergique",
	},
	[CONJUGATION_TYPES.ba]: {
		name: "Conditionnel 〜ば",
		affirmative: "Condition logique essentielle (« si... alors »)",
		negative: "Condition négative (« si on ne fait pas... »)",
		tooltip: "Conditionnel en 〜ば : condition logique indispensable (si...)",
	},
	[CONJUGATION_TYPES.tara]: {
		name: "Conditionnel 〜たら",
		affirmative: "Condition temporelle ou hypothèse (« quand / une fois que / si »)",
		negative: "Condition négative (« quand / si on ne fait pas »)",
		tooltip: "Conditionnel en 〜たら : chronologie (quand / une fois fait / si)",
	},
	[CONJUGATION_TYPES.tai]: {
		name: "Désiratif 〜たい",
		affirmative: "Désir ou envie du locuteur (« vouloir faire »)",
		negative: "Absence d'envie (« ne pas vouloir faire »)",
		tooltip: "Désiratif en 〜たい : souhait du locuteur (vouloir faire)",
	},
	[CONJUGATION_TYPES.adverb]: {
		name: "Adverbe",
		affirmative: "Modifie un verbe ou une action (« de manière... »)",
		negative: "Forme adverbiale négative",
		tooltip: "Adverbe : qualifier un verbe ou une action",
	},
});

/**
 * Renvoie l'explication et le tooltip adaptés à la conjugaison demandée.
 * @param {Object} conjugation
 * @returns {{ name: string, shortText: string, tooltip: string } | null}
 */
export function getConjugationDescription(conjugation) {
	if (!conjugation || !conjugation.type) {
		return null;
	}

	const info = CONJUGATION_DESCRIPTIONS[conjugation.type];
	if (!info) {
		return null;
	}

	const isNegative = conjugation.affirmative === false;
	const shortText = isNegative ? info.negative : info.affirmative;

	return {
		name: info.name,
		shortText,
		tooltip: info.tooltip,
	};
}

/**
 * Renvoie le libellé de la forme demandée, avec ou sans le rappel de terminaison (~...).
 * @param {string} type - Type de conjugaison (ex: CONJUGATION_TYPES.causative)
 * @param {boolean} showPatterns - Afficher ou non le modèle ~<...>
 * @returns {string}
 */
export function getConjugationFormLabel(type, showPatterns = true) {
	switch (type) {
		case CONJUGATION_TYPES.present:
			return "Présent";
		case CONJUGATION_TYPES.past:
			return "Passé";
		case CONJUGATION_TYPES.te:
			return showPatterns ? "Forme en 〜て" : "Forme en te";
		case CONJUGATION_TYPES.adverb:
			return "Adverbe";
		case CONJUGATION_TYPES.volitional:
			return showPatterns ? "Volitionnel (〜よう)" : "Volitionnel";
		case CONJUGATION_TYPES.passive:
			return showPatterns ? "Passif (〜られる)" : "Passif";
		case CONJUGATION_TYPES.causative:
			return showPatterns ? "Causatif (〜させる)" : "Causatif";
		case CONJUGATION_TYPES.potential:
			return showPatterns ? "Potentiel (〜る / られる)" : "Potentiel";
		case CONJUGATION_TYPES.imperative:
			return showPatterns ? "Impératif (~ろ)" : "Impératif";
		case CONJUGATION_TYPES.causativePassive:
			return showPatterns ? "Causatif-Passif (〜させられる)" : "Causatif-Passif";
		case CONJUGATION_TYPES.ba:
			return showPatterns ? "Conditionnel 〜ば" : "Conditionnel (ba)";
		case CONJUGATION_TYPES.tara:
			return showPatterns ? "Conditionnel 〜たら" : "Conditionnel (tara)";
		case CONJUGATION_TYPES.tai:
			return showPatterns ? "Désiratif 〜たい" : "Désiratif";
		default:
			return "";
	}
}

