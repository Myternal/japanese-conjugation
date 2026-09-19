import { PARTS_OF_SPEECH, CONJUGATION_TYPES } from "../constants.js";

// Utility sound-change helpers
export function changeUtoI(c) {
	switch (c) {
		case "う": return "い";
		case "く": return "き";
		case "ぐ": return "ぎ";
		case "す": return "し";
		case "ず": return "じ";
		case "つ": return "ち";
		case "づ": return "ぢ";
		case "ぬ": return "に";
		case "ふ": return "ひ";
		case "ぶ": return "び";
		case "ぷ": return "ぴ";
		case "む": return "み";
		case "る": return "り";
		default: return c;
	}
}

export function changeUtoA(c) {
	switch (c) {
		case "う": return "わ";
		case "く": return "か";
		case "ぐ": return "が";
		case "す": return "さ";
		case "ず": return "ざ";
		case "つ": return "た";
		case "づ": return "だ";
		case "ぬ": return "な";
		case "ふ": return "は";
		case "ぶ": return "ば";
		case "ぷ": return "ぱ";
		case "む": return "ま";
		case "る": return "ら";
		default: return c;
	}
}

export function changeUtoO(c) {
	switch (c) {
		case "う": return "お";
		case "く": return "こ";
		case "ぐ": return "ご";
		case "す": return "そ";
		case "ず": return "ぞ";
		case "つ": return "と";
		case "づ": return "ど";
		case "ぬ": return "の";
		case "ふ": return "ほ";
		case "ぶ": return "ぼ";
		case "ぷ": return "ぽ";
		case "む": return "も";
		case "る": return "ろ";
		default: return c;
	}
}

export function changeUtoE(c) {
	switch (c) {
		case "う": return "え";
		case "く": return "け";
		case "ぐ": return "げ";
		case "す": return "せ";
		case "ず": return "ぜ";
		case "つ": return "て";
		case "づ": return "で";
		case "ぬ": return "ね";
		case "ふ": return "へ";
		case "ぶ": return "べ";
		case "ぷ": return "ぺ";
		case "む": return "め";
		case "る": return "れ";
		default: return c;
	}
}

export function changeToPastPlain(c) {
	switch (c) {
		case "す": return "した";
		case "く": return "いた";
		case "ぐ": return "いだ";
		case "む":
		case "ぶ":
		case "ぬ": return "んだ";
		case "る":
		case "う":
		case "つ": return "った";
		default: return c;
	}
}

export function dropFinalLetter(word) {
	return word.substring(0, word.length - 1);
}

export function masuStem(baseVerbText, type) {
	return type === "u"
		? dropFinalLetter(baseVerbText) + changeUtoI(baseVerbText.charAt(baseVerbText.length - 1))
		: dropFinalLetter(baseVerbText);
}

export function plainNegativeComplete(hiraganaVerb, type) {
	return type === "u"
		? dropFinalLetter(hiraganaVerb) + changeUtoA(hiraganaVerb.charAt(hiraganaVerb.length - 1)) + "ない"
		: dropFinalLetter(hiraganaVerb) + "ない";
}

export function toKanjiPlusHiragana(wordHtml) {
	return wordHtml.replace(/<ruby>|<\/ruby>|<rt>.*?<\/rt>/g, "");
}

export function toHiragana(wordHtml) {
	return wordHtml
		.replace(/<ruby>[^<]*<rt>(.*?)<\/rt><\/ruby>/g, "$1")
		.replace(/<ruby>|<\/ruby>|.<rt>|<\/rt>/g, "");
}

export function getPartOfSpeech(wordJSON) {
	if (wordJSON.type === "u" || wordJSON.type === "ru" || wordJSON.type === "irv") {
		return PARTS_OF_SPEECH.verb;
	} else if (wordJSON.type === "i" || wordJSON.type === "na" || wordJSON.type === "ira") {
		return PARTS_OF_SPEECH.adjective;
	}
	return PARTS_OF_SPEECH.verb;
}

export function checkSuffix(hiraganaWord, suffix) {
	for (let i = 1; i <= suffix.length; i++) {
		if (hiraganaWord[hiraganaWord.length - i] !== suffix[suffix.length - i]) {
			return false;
		}
	}
	return hiraganaWord.slice(0, hiraganaWord.length - suffix.length);
}

// Irregular Verbs
export function touConjugation(affirmative, polite, conjugationType, isKanji) {
	const firstLetter = isKanji ? "問" : "と";
	const plainForm = firstLetter + "う";

	if (conjugationType === CONJUGATION_TYPES.present) {
		if (affirmative && polite) return `${firstLetter}います`;
		if (affirmative && !polite) return `${firstLetter}う`;
		if (!affirmative && polite) return [`${firstLetter}いません`, `${firstLetter}わないです`];
		if (!affirmative && !polite) return `${firstLetter}わない`;
	} else if (conjugationType === CONJUGATION_TYPES.past) {
		if (affirmative && polite) return `${firstLetter}いました`;
		if (affirmative && !polite) return `${firstLetter}うた`;
		if (!affirmative && polite) return [`${firstLetter}いませんでした`, `${firstLetter}わなかったです`];
		if (!affirmative && !polite) return `${firstLetter}わなかった`;
	} else if (conjugationType === CONJUGATION_TYPES.te) {
		return `${firstLetter}うて`;
	} else if (conjugationType === CONJUGATION_TYPES.volitional) {
		return polite ? `${firstLetter}いましょう` : `${firstLetter}おう`;
	} else if (conjugationType === CONJUGATION_TYPES.ba) {
		if (affirmative) return `${firstLetter}えば`;
		return polite
			? [`${firstLetter}いませんなら`, `${firstLetter}わなければ`]
			: [`${firstLetter}わなければ`, `${firstLetter}わなきゃ`];
	} else if (conjugationType === CONJUGATION_TYPES.tara) {
		if (affirmative && polite) return `${firstLetter}いましたら`;
		if (affirmative && !polite) return `${firstLetter}うたら`;
		if (!affirmative && polite) return `${firstLetter}いませんでしたら`;
		if (!affirmative && !polite) return `${firstLetter}わなかったら`;
	} else if (conjugationType === CONJUGATION_TYPES.tai) {
		const stem = `${firstLetter}い`;
		if (affirmative && polite) return `${stem}たいです`;
		if (affirmative && !polite) return `${stem}たい`;
		if (!affirmative && polite) return [`${stem}たくないです`, `${stem}たくありません`];
		if (!affirmative && !polite) return `${stem}たくない`;
	} else if (
		conjugationType === CONJUGATION_TYPES.passive ||
		conjugationType === CONJUGATION_TYPES.causative ||
		conjugationType === CONJUGATION_TYPES.potential ||
		conjugationType === CONJUGATION_TYPES.imperative ||
		conjugationType === CONJUGATION_TYPES.causativePassive
	) {
		return conjugationFunctions.verb[conjugationType](plainForm, "u", affirmative, polite);
	}
}

export function aruConjugation(affirmative, polite, conjugationType) {
	if (conjugationType === CONJUGATION_TYPES.present) {
		if (affirmative && polite) return "あります";
		if (affirmative && !polite) return "ある";
		if (!affirmative && polite) return ["ありません", "ないです"];
		if (!affirmative && !polite) return "ない";
	} else if (conjugationType === CONJUGATION_TYPES.past) {
		if (affirmative && polite) return "ありました";
		if (affirmative && !polite) return "あった";
		if (!affirmative && polite) return ["ありませんでした", "なかったです"];
		if (!affirmative && !polite) return "なかった";
	} else if (conjugationType === CONJUGATION_TYPES.te) {
		return "あって";
	} else if (conjugationType === CONJUGATION_TYPES.volitional) {
		return polite ? "ありましょう" : "あろう";
	} else if (conjugationType === CONJUGATION_TYPES.ba) {
		if (affirmative) return "あれば";
		return polite ? ["ありませんなら", "なければ"] : ["なければ", "なきゃ"];
	} else if (conjugationType === CONJUGATION_TYPES.tara) {
		if (affirmative && polite) return "ありましたら";
		if (affirmative && !polite) return "あったら";
		if (!affirmative && polite) return "ありませんでしたら";
		if (!affirmative && !polite) return "なかったら";
	} else if (conjugationType === CONJUGATION_TYPES.tai) {
		if (affirmative && polite) return "ありたいです";
		if (affirmative && !polite) return "ありたい";
		if (!affirmative && polite) return ["ありたくないです", "ありたくありません"];
		if (!affirmative && !polite) return "ありたくない";
	} else if (
		conjugationType === CONJUGATION_TYPES.passive ||
		conjugationType === CONJUGATION_TYPES.causative ||
		conjugationType === CONJUGATION_TYPES.imperative ||
		conjugationType === CONJUGATION_TYPES.causativePassive
	) {
		return conjugationFunctions.verb[conjugationType]("ある", "u", affirmative, polite);
	} else if (conjugationType === CONJUGATION_TYPES.potential) {
		if (affirmative && polite) return ["ありえます", "あり得ます"];
		if (affirmative && !polite) return ["ありえる", "あり得る", "ありうる"];
		if (!affirmative && polite) return ["ありえません", "あり得ません"];
		if (!affirmative && !polite) return ["ありえない", "あり得ない"];
	}
}

export function kuruConjugation(affirmative, polite, conjugationType, isKanji) {
	let retval;
	if (conjugationType === CONJUGATION_TYPES.present) {
		if (affirmative && polite) retval = "きます";
		else if (affirmative && !polite) retval = "くる";
		else if (!affirmative && polite) retval = ["きません", "こないです"];
		else if (!affirmative && !polite) retval = "こない";
	} else if (conjugationType === CONJUGATION_TYPES.past) {
		if (affirmative && polite) retval = "きました";
		else if (affirmative && !polite) retval = "きた";
		else if (!affirmative && polite) retval = ["きませんでした", "こなかったです"];
		else if (!affirmative && !polite) retval = "こなかった";
	} else if (conjugationType === CONJUGATION_TYPES.te) {
		retval = "きて";
	} else if (conjugationType === CONJUGATION_TYPES.volitional) {
		retval = polite ? "きましょう" : "こよう";
	} else if (conjugationType === CONJUGATION_TYPES.ba) {
		if (affirmative) {
			retval = "くれば";
		} else {
			retval = polite ? ["きませんなら", "こなければ"] : ["こなければ", "こなきゃ"];
		}
	} else if (conjugationType === CONJUGATION_TYPES.tara) {
		if (affirmative && polite) retval = "きましたら";
		else if (affirmative && !polite) retval = "きたら";
		else if (!affirmative && polite) retval = "きませんでしたら";
		else if (!affirmative && !polite) retval = "こなかったら";
	} else if (conjugationType === CONJUGATION_TYPES.tai) {
		if (affirmative && polite) retval = "きたいです";
		else if (affirmative && !polite) retval = "きたい";
		else if (!affirmative && polite) retval = ["きたくないです", "きたくありません"];
		else if (!affirmative && !polite) retval = "きたくない";
	} else if (
		conjugationType === CONJUGATION_TYPES.passive ||
		conjugationType === CONJUGATION_TYPES.causative ||
		conjugationType === CONJUGATION_TYPES.potential ||
		conjugationType === CONJUGATION_TYPES.causativePassive
	) {
		retval = conjugationFunctions.verb[conjugationType]("こる", "ru", affirmative, polite);
	} else if (conjugationType === CONJUGATION_TYPES.imperative) {
		retval = "こい";
	}

	if (isKanji && retval != null) {
		if (typeof retval === "string") {
			retval = "来" + retval.substring(1);
		} else {
			retval = retval.map((v) => "来" + v.substring(1));
		}
	}
	return retval;
}

export function suruConjugation(affirmative, polite, conjugationType) {
	if (conjugationType === CONJUGATION_TYPES.present) {
		if (affirmative && polite) return "します";
		if (affirmative && !polite) return "する";
		if (!affirmative && polite) return ["しません", "しないです"];
		if (!affirmative && !polite) return "しない";
	} else if (conjugationType === CONJUGATION_TYPES.past) {
		if (affirmative && polite) return "しました";
		if (affirmative && !polite) return "した";
		if (!affirmative && polite) return ["しませんでした", "しなかったです"];
		if (!affirmative && !polite) return "しなかった";
	} else if (conjugationType === CONJUGATION_TYPES.te) {
		return "して";
	} else if (conjugationType === CONJUGATION_TYPES.volitional) {
		return polite ? "しましょう" : "しよう";
	} else if (conjugationType === CONJUGATION_TYPES.ba) {
		if (affirmative) return "すれば";
		return polite ? ["しませんなら", "しなければ"] : ["しなければ", "しなきゃ"];
	} else if (conjugationType === CONJUGATION_TYPES.tara) {
		if (affirmative && polite) return "しましたら";
		if (affirmative && !polite) return "したら";
		if (!affirmative && polite) return "しませんでしたら";
		if (!affirmative && !polite) return "しなかったら";
	} else if (conjugationType === CONJUGATION_TYPES.tai) {
		if (affirmative && polite) return "したいです";
		if (affirmative && !polite) return "したい";
		if (!affirmative && polite) return ["したくないです", "したくありません"];
		if (!affirmative && !polite) return "したくない";
	} else if (conjugationType === CONJUGATION_TYPES.passive) {
		if (affirmative && polite) return "されます";
		if (affirmative && !polite) return "される";
		if (!affirmative && polite) return "されません";
		if (!affirmative && !polite) return "されない";
	} else if (conjugationType === CONJUGATION_TYPES.causative) {
		if (affirmative && polite) return "させます";
		if (affirmative && !polite) return "させる";
		if (!affirmative && polite) return "させません";
		if (!affirmative && !polite) return "させない";
	} else if (conjugationType === CONJUGATION_TYPES.causativePassive) {
		if (affirmative && polite) return "させられます";
		if (affirmative && !polite) return "させられる";
		if (!affirmative && polite) return "させられません";
		if (!affirmative && !polite) return "させられない";
	} else if (conjugationType === CONJUGATION_TYPES.potential) {
		if (affirmative && polite) return ["できます", "出来ます"];
		if (affirmative && !polite) return ["できる", "出来る"];
		if (!affirmative && polite) return ["できません", "出来ません"];
		if (!affirmative && !polite) return ["できない", "出来ない"];
	} else if (conjugationType === CONJUGATION_TYPES.imperative) {
		return ["しろ", "せよ"];
	}
}

export function ikuConjugation(affirmative, polite, conjugationType, isKanji) {
	const firstLetter = isKanji ? "行" : "い";
	const plainForm = firstLetter + "く";

	if (conjugationType === CONJUGATION_TYPES.present) {
		if (affirmative && polite) return `${firstLetter}きます`;
		if (affirmative && !polite) return `${firstLetter}く`;
		if (!affirmative && polite) return [`${firstLetter}きません`, `${firstLetter}かないです`];
		if (!affirmative && !polite) return `${firstLetter}かない`;
	} else if (conjugationType === CONJUGATION_TYPES.past) {
		if (affirmative && polite) return `${firstLetter}きました`;
		if (affirmative && !polite) return `${firstLetter}った`;
		if (!affirmative && polite) return [`${firstLetter}きませんでした`, `${firstLetter}かなかったです`];
		if (!affirmative && !polite) return `${firstLetter}かなかった`;
	} else if (conjugationType === CONJUGATION_TYPES.te) {
		return `${firstLetter}って`;
	} else if (conjugationType === CONJUGATION_TYPES.volitional) {
		return polite ? `${firstLetter}きましょう` : `${firstLetter}こう`;
	} else if (conjugationType === CONJUGATION_TYPES.ba) {
		if (affirmative) return `${firstLetter}けば`;
		return polite
			? [`${firstLetter}きませんなら`, `${firstLetter}かなければ`]
			: [`${firstLetter}かなければ`, `${firstLetter}かなきゃ`];
	} else if (conjugationType === CONJUGATION_TYPES.tara) {
		if (affirmative && polite) return `${firstLetter}きましたら`;
		if (affirmative && !polite) return `${firstLetter}ったら`;
		if (!affirmative && polite) return `${firstLetter}きませんでしたら`;
		if (!affirmative && !polite) return `${firstLetter}かなかったら`;
	} else if (conjugationType === CONJUGATION_TYPES.tai) {
		const stem = `${firstLetter}き`;
		if (affirmative && polite) return `${stem}たいです`;
		if (affirmative && !polite) return `${stem}たい`;
		if (!affirmative && polite) return [`${stem}たくないです`, `${stem}たくありません`];
		if (!affirmative && !polite) return `${stem}たくない`;
	} else if (
		conjugationType === CONJUGATION_TYPES.passive ||
		conjugationType === CONJUGATION_TYPES.causative ||
		conjugationType === CONJUGATION_TYPES.potential ||
		conjugationType === CONJUGATION_TYPES.imperative ||
		conjugationType === CONJUGATION_TYPES.causativePassive
	) {
		return conjugationFunctions.verb[conjugationType](plainForm, "u", affirmative, polite);
	}
}

export function irregularVerbConjugation(hiraganaVerb, affirmative, polite, conjugationType) {
	let prefix, conjugatedSuffix;
	if ((prefix = checkSuffix(hiraganaVerb, "いく")) !== false) {
		conjugatedSuffix = ikuConjugation(affirmative, polite, conjugationType, false);
	} else if ((prefix = checkSuffix(hiraganaVerb, "行く")) !== false) {
		conjugatedSuffix = ikuConjugation(affirmative, polite, conjugationType, true);
	} else if ((prefix = checkSuffix(hiraganaVerb, "する")) !== false) {
		conjugatedSuffix = suruConjugation(affirmative, polite, conjugationType);
	} else if ((prefix = checkSuffix(hiraganaVerb, "くる")) !== false) {
		conjugatedSuffix = kuruConjugation(affirmative, polite, conjugationType, false);
	} else if ((prefix = checkSuffix(hiraganaVerb, "来る")) !== false) {
		conjugatedSuffix = kuruConjugation(affirmative, polite, conjugationType, true);
	} else if ((prefix = checkSuffix(hiraganaVerb, "ある")) !== false) {
		conjugatedSuffix = aruConjugation(affirmative, polite, conjugationType);
	} else if ((prefix = checkSuffix(hiraganaVerb, "とう")) !== false) {
		conjugatedSuffix = touConjugation(affirmative, polite, conjugationType, false);
	} else if ((prefix = checkSuffix(hiraganaVerb, "問う")) !== false) {
		conjugatedSuffix = touConjugation(affirmative, polite, conjugationType, true);
	}

	if (typeof conjugatedSuffix === "string") {
		return prefix + conjugatedSuffix;
	} else if (Array.isArray(conjugatedSuffix)) {
		return conjugatedSuffix.map((suffix) => prefix + suffix);
	}
	return null;
}

// Irregular Adjectives
export function iiConjugation(affirmative, polite, conjugationType) {
	if (conjugationType === CONJUGATION_TYPES.present) {
		if (affirmative && polite) return ["いいです", "良いです"];
		if (affirmative && !polite) return ["いい", "良い"];
		if (!affirmative && polite) return ["よくないです", "よくありません", "良くないです", "良くありません"];
		if (!affirmative && !polite) return ["よくない", "良くない"];
	} else if (conjugationType === CONJUGATION_TYPES.past) {
		if (affirmative && polite) return ["よかったです", "良かったです"];
		if (affirmative && !polite) return ["よかった", "良かった"];
		if (!affirmative && polite) return ["よくなかったです", "よくありませんでした", "良くなかったです", "良くありませんでした"];
		if (!affirmative && !polite) return ["よくなかった", "良くなかった"];
	} else if (conjugationType === CONJUGATION_TYPES.adverb) {
		return ["よく", "良く"];
	} else if (conjugationType === CONJUGATION_TYPES.ba) {
		if (affirmative) return ["よければ", "良ければ"];
		return polite
			? ["よくありませんなら", "よくないなら", "良くなければ", "よくなければ"]
			: ["よくなければ", "良くなければ", "よくなきゃ", "良くなきゃ"];
	} else if (conjugationType === CONJUGATION_TYPES.tara) {
		if (affirmative && polite) return ["よかったですなら", "良かったですなら", "よかったら", "良かったら"];
		if (affirmative && !polite) return ["よかったら", "良かったら"];
		if (!affirmative && polite) return ["よくなかったら", "良くなかったら", "よくありませんでしたら"];
		if (!affirmative && !polite) return ["よくなかったら", "良くなかったら"];
	}
}

export function irregularAdjectiveConjugation(hiraganaAdjective, affirmative, polite, conjugationType) {
	if (hiraganaAdjective === "いい") {
		return iiConjugation(affirmative, polite, conjugationType);
	} else if (hiraganaAdjective === "かっこいい") {
		const conjugations = [].concat(iiConjugation(affirmative, polite, conjugationType));
		return conjugations.map((c) => "かっこ" + c);
	}
}

export const conjugationFunctions = {
	[PARTS_OF_SPEECH.verb]: {
		[CONJUGATION_TYPES.present]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.present);
			} else if (affirmative && polite) {
				return masuStem(baseVerbText, type) + "ます";
			} else if (affirmative && !polite) {
				return baseVerbText;
			} else if (!affirmative && polite) {
				return [
					masuStem(baseVerbText, type) + "ません",
					plainNegativeComplete(baseVerbText, type) + "です",
				];
			} else if (!affirmative && !polite) {
				return plainNegativeComplete(baseVerbText, type);
			}
		},

		[CONJUGATION_TYPES.past]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.past);
			} else if (affirmative && polite) {
				return masuStem(baseVerbText, type) + "ました";
			} else if (affirmative && !polite && type === "u") {
				return dropFinalLetter(baseVerbText) + changeToPastPlain(baseVerbText.charAt(baseVerbText.length - 1));
			} else if (affirmative && !polite && type === "ru") {
				return masuStem(baseVerbText, type) + "た";
			} else if (!affirmative && polite) {
				const plainNegative = plainNegativeComplete(baseVerbText, type);
				const plainNegativePast = dropFinalLetter(plainNegative) + "かった";
				return [
					masuStem(baseVerbText, type) + "ませんでした",
					plainNegativePast + "です",
				];
			} else if (!affirmative && !polite) {
				const plainNegative = plainNegativeComplete(baseVerbText, type);
				return dropFinalLetter(plainNegative) + "かった";
			}
		},

		[CONJUGATION_TYPES.te]: function (baseVerbText, type) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, false, false, CONJUGATION_TYPES.te);
			} else if (type === "u") {
				const finalChar = baseVerbText.charAt(baseVerbText.length - 1);
				if (finalChar === "う" || finalChar === "つ" || finalChar === "る") {
					return dropFinalLetter(baseVerbText) + "って";
				} else if (finalChar === "む" || finalChar === "ぶ" || finalChar === "ぬ") {
					return dropFinalLetter(baseVerbText) + "んで";
				} else if (finalChar === "く") {
					return dropFinalLetter(baseVerbText) + "いて";
				} else if (finalChar === "ぐ") {
					return dropFinalLetter(baseVerbText) + "いで";
				} else if (finalChar === "す") {
					return dropFinalLetter(baseVerbText) + "して";
				}
			} else if (type === "ru") {
				return masuStem(baseVerbText, type) + "て";
			}
		},

		[CONJUGATION_TYPES.volitional]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, false, polite, CONJUGATION_TYPES.volitional);
			} else if (polite) {
				return masuStem(baseVerbText, type) + "ましょう";
			} else if (!polite) {
				if (type === "u") {
					return dropFinalLetter(baseVerbText) + changeUtoO(baseVerbText.charAt(baseVerbText.length - 1)) + "う";
				} else if (type === "ru") {
					return masuStem(baseVerbText, type) + "よう";
				}
			}
		},

		[CONJUGATION_TYPES.passive]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.passive);
			}
			const stem = type === "ru"
				? dropFinalLetter(baseVerbText) + "ら"
				: dropFinalLetter(baseVerbText) + changeUtoA(baseVerbText.charAt(baseVerbText.length - 1));

			if (affirmative && polite) return stem + "れます";
			if (affirmative && !polite) return stem + "れる";
			if (!affirmative && polite) return stem + "れません";
			if (!affirmative && !polite) return stem + "れない";
		},

		[CONJUGATION_TYPES.causative]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.causative);
			}
			const stem = type === "ru"
				? dropFinalLetter(baseVerbText) + "さ"
				: dropFinalLetter(baseVerbText) + changeUtoA(baseVerbText.charAt(baseVerbText.length - 1));

			if (affirmative && polite) return stem + "せます";
			if (affirmative && !polite) return stem + "せる";
			if (!affirmative && polite) return stem + "せません";
			if (!affirmative && !polite) return stem + "せない";
		},

		[CONJUGATION_TYPES.potential]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.potential);
			}
			const roots = [];
			if (type === "u") {
				roots.push(dropFinalLetter(baseVerbText) + changeUtoE(baseVerbText.charAt(baseVerbText.length - 1)));
			} else if (type === "ru") {
				roots.push(dropFinalLetter(baseVerbText) + "られ");
				roots.push(dropFinalLetter(baseVerbText) + "れ"); // short form
			}

			if (affirmative && polite) return roots.map((r) => r + "ます");
			if (affirmative && !polite) return roots.map((r) => r + "る");
			if (!affirmative && polite) return roots.map((r) => r + "ません");
			if (!affirmative && !polite) return roots.map((r) => r + "ない");
		},

		[CONJUGATION_TYPES.imperative]: function (baseVerbText, type) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, null, null, CONJUGATION_TYPES.imperative);
			}
			if (type === "ru") {
				return [dropFinalLetter(baseVerbText) + "ろ", dropFinalLetter(baseVerbText) + "よ"];
			}
			if (type === "u") {
				return dropFinalLetter(baseVerbText) + changeUtoE(baseVerbText.charAt(baseVerbText.length - 1));
			}
		},

		[CONJUGATION_TYPES.causativePassive]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.causativePassive);
			}
			const roots = [];
			if (type === "u") {
				const finalChar = baseVerbText.charAt(baseVerbText.length - 1);
				const root = dropFinalLetter(baseVerbText) + changeUtoA(finalChar);
				roots.push(root + "せられ");
				if (finalChar !== "す") {
					roots.push(root + "され"); // short form (not applicable to す-verbs)
				}
			} else if (type === "ru") {
				roots.push(dropFinalLetter(baseVerbText) + "させられ");
			}

			if (affirmative && polite) return roots.map((r) => r + "ます");
			if (affirmative && !polite) return roots.map((r) => r + "る");
			if (!affirmative && polite) return roots.map((r) => r + "ません");
			if (!affirmative && !polite) return roots.map((r) => r + "ない");
		},

		// Conditional: 〜ば
		[CONJUGATION_TYPES.ba]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.ba);
			}
			if (affirmative) {
				if (type === "u") {
					return dropFinalLetter(baseVerbText) + changeUtoE(baseVerbText.charAt(baseVerbText.length - 1)) + "ば";
				} else if (type === "ru") {
					return dropFinalLetter(baseVerbText) + "れば";
				}
			} else {
				// Negative: -なければ / -なきゃ
				const neg = plainNegativeComplete(baseVerbText, type);
				const stem = dropFinalLetter(neg);
				return [`${stem}ければ`, `${stem}きゃ`];
			}
		},

		// Conditional: 〜たら
		[CONJUGATION_TYPES.tara]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.tara);
			}
			if (affirmative) {
				if (polite) {
					return masuStem(baseVerbText, type) + "ましたら";
				}
				if (type === "u") {
					return dropFinalLetter(baseVerbText) + changeToPastPlain(baseVerbText.charAt(baseVerbText.length - 1)) + "ら";
				} else if (type === "ru") {
					return masuStem(baseVerbText, type) + "たら";
				}
			} else {
				if (polite) {
					return masuStem(baseVerbText, type) + "ませんでしたら";
				}
				const neg = plainNegativeComplete(baseVerbText, type);
				return dropFinalLetter(neg) + "かったら";
			}
		},

		// Desiderative: 〜たい
		[CONJUGATION_TYPES.tai]: function (baseVerbText, type, affirmative, polite) {
			if (type === "irv") {
				return irregularVerbConjugation(baseVerbText, affirmative, polite, CONJUGATION_TYPES.tai);
			}
			const stem = masuStem(baseVerbText, type) + "た";
			if (affirmative && polite) return stem + "いです";
			if (affirmative && !polite) return stem + "い";
			if (!affirmative && polite) return [stem + "くないです", stem + "くありません"];
			if (!affirmative && !polite) return stem + "くない";
		},
	},

	[PARTS_OF_SPEECH.adjective]: {
		[CONJUGATION_TYPES.present]: function (baseAdjectiveText, type, affirmative, polite) {
			if (type === "ira") {
				return irregularAdjectiveConjugation(baseAdjectiveText, affirmative, polite, CONJUGATION_TYPES.present);
			} else if (affirmative && polite) {
				return baseAdjectiveText + "です";
			} else if (affirmative && !polite && type === "i") {
				return baseAdjectiveText;
			} else if (affirmative && !polite && type === "na") {
				return baseAdjectiveText + "だ";
			} else if (!affirmative && polite && type === "i") {
				return [
					dropFinalLetter(baseAdjectiveText) + "くないです",
					dropFinalLetter(baseAdjectiveText) + "くありません",
				];
			} else if (!affirmative && polite && type === "na") {
				return [
					baseAdjectiveText + "じゃないです",
					baseAdjectiveText + "ではないです",
					baseAdjectiveText + "じゃありません",
					baseAdjectiveText + "ではありません",
				];
			} else if (!affirmative && !polite && type === "i") {
				return dropFinalLetter(baseAdjectiveText) + "くない";
			} else if (!affirmative && !polite && type === "na") {
				return [
					baseAdjectiveText + "じゃない",
					baseAdjectiveText + "ではない",
				];
			}
		},

		[CONJUGATION_TYPES.past]: function (baseAdjectiveText, type, affirmative, polite) {
			if (type === "ira") {
				return irregularAdjectiveConjugation(baseAdjectiveText, affirmative, polite, CONJUGATION_TYPES.past);
			} else if (affirmative && polite && type === "i") {
				return dropFinalLetter(baseAdjectiveText) + "かったです";
			} else if (affirmative && polite && type === "na") {
				return baseAdjectiveText + "でした";
			} else if (affirmative && !polite && type === "i") {
				return dropFinalLetter(baseAdjectiveText) + "かった";
			} else if (affirmative && !polite && type === "na") {
				return baseAdjectiveText + "だった";
			} else if (!affirmative && polite && type === "i") {
				return [
					dropFinalLetter(baseAdjectiveText) + "くなかったです",
					dropFinalLetter(baseAdjectiveText) + "くありませんでした",
				];
			} else if (!affirmative && polite && type === "na") {
				return [
					baseAdjectiveText + "じゃなかったです",
					baseAdjectiveText + "ではなかったです",
					baseAdjectiveText + "じゃありませんでした",
					baseAdjectiveText + "ではありませんでした",
				];
			} else if (!affirmative && !polite && type === "i") {
				return dropFinalLetter(baseAdjectiveText) + "くなかった";
			} else if (!affirmative && !polite && type === "na") {
				return [
					baseAdjectiveText + "じゃなかった",
					baseAdjectiveText + "ではなかった",
				];
			}
		},

		[CONJUGATION_TYPES.adverb]: function (baseAdjectiveText, type) {
			if (type === "ira") {
				return irregularAdjectiveConjugation(baseAdjectiveText, false, false, CONJUGATION_TYPES.adverb);
			} else if (type === "i") {
				return dropFinalLetter(baseAdjectiveText) + "く";
			} else if (type === "na") {
				return baseAdjectiveText + "に";
			}
		},

		// Conditional: 〜ば for adjectives
		[CONJUGATION_TYPES.ba]: function (baseAdjectiveText, type, affirmative, polite) {
			if (type === "ira") {
				return irregularAdjectiveConjugation(baseAdjectiveText, affirmative, polite, CONJUGATION_TYPES.ba);
			}
			if (type === "i") {
				if (affirmative) {
					return dropFinalLetter(baseAdjectiveText) + "ければ";
				} else {
					return [
						dropFinalLetter(baseAdjectiveText) + "くなければ",
						dropFinalLetter(baseAdjectiveText) + "くなきゃ",
					];
				}
			} else if (type === "na") {
				if (affirmative) {
					return [
						baseAdjectiveText + "なら",
						baseAdjectiveText + "ならば",
						baseAdjectiveText + "であれば",
					];
				} else {
					return [
						baseAdjectiveText + "じゃなければ",
						baseAdjectiveText + "でなければ",
						baseAdjectiveText + "ではなければ",
					];
				}
			}
		},

		// Conditional: 〜たら for adjectives
		[CONJUGATION_TYPES.tara]: function (baseAdjectiveText, type, affirmative, polite) {
			if (type === "ira") {
				return irregularAdjectiveConjugation(baseAdjectiveText, affirmative, polite, CONJUGATION_TYPES.tara);
			}
			if (type === "i") {
				if (affirmative) {
					return dropFinalLetter(baseAdjectiveText) + "かったら";
				} else {
					return dropFinalLetter(baseAdjectiveText) + "くなかったら";
				}
			} else if (type === "na") {
				if (affirmative) {
					return polite
						? [baseAdjectiveText + "でしたら"]
						: [baseAdjectiveText + "だったら"];
				} else {
					return polite
						? [
								baseAdjectiveText + "じゃありませんでしたら",
								baseAdjectiveText + "ではありませんでしたら",
						  ]
						: [
								baseAdjectiveText + "じゃなかったら",
								baseAdjectiveText + "ではなかったら",
						  ];
				}
			}
		},
	},
};

export class Conjugation {
	constructor(validAnswers, conjugationType, affirmative, polite) {
		this.validAnswers = validAnswers;
		this.type = conjugationType;
		this.affirmative = affirmative;
		this.polite = polite;
	}
}

export function getConjugation(wordJSON, partOfSpeech, conjugationType, validBaseWordSpellings, affirmative, polite) {
	const validConjugatedAnswers = [];
	const conjugationFunction = conjugationFunctions[partOfSpeech]?.[conjugationType];

	if (!conjugationFunction) return null;

	const uniqueBaseWords = Array.from(new Set(validBaseWordSpellings || []));

	uniqueBaseWords.forEach((baseWord) => {
		const res = conjugationFunction(baseWord, wordJSON.type, affirmative, polite);
		if (res != null) {
			validConjugatedAnswers.push(res);
		}
	});

	const uniqueAnswers = Array.from(new Set(validConjugatedAnswers.flat()));
	if (uniqueAnswers.length === 0) return null;

	return new Conjugation(
		uniqueAnswers,
		conjugationType,
		affirmative,
		polite
	);
}

export function getStandardVariationConjugations(wordJSON, partOfSpeech, conjugationType, validBaseWordSpellings) {
	const conjugationObjects = [];
	let affirmative = false,
		polite = false;

	for (let i = 0; i < 4; i++) {
		if (i % 2 === 0) {
			affirmative = !affirmative;
		}
		polite = !polite;

		if (
			affirmative &&
			!polite &&
			conjugationType === CONJUGATION_TYPES.present &&
			wordJSON.type !== "na"
		) {
			continue;
		}

		const conj = getConjugation(
			wordJSON,
			partOfSpeech,
			conjugationType,
			validBaseWordSpellings,
			affirmative,
			polite
		);
		if (conj) conjugationObjects.push(conj);
	}

	return conjugationObjects;
}

export function getAllConjugations(wordJSON) {
	const allConjugations = [];
	const partOfSpeech = getPartOfSpeech(wordJSON);

	let validBaseWordSpellings = Array.from(
		new Set([
			toHiragana(wordJSON.kanji),
			toKanjiPlusHiragana(wordJSON.kanji),
			...(wordJSON.altOkurigana || []),
		])
	);

	const typesWithStandardVariations = [
		CONJUGATION_TYPES.present,
		CONJUGATION_TYPES.past,
	];

	if (partOfSpeech === PARTS_OF_SPEECH.verb) {
		typesWithStandardVariations.push(CONJUGATION_TYPES.passive);
		typesWithStandardVariations.push(CONJUGATION_TYPES.causative);
		typesWithStandardVariations.push(CONJUGATION_TYPES.causativePassive);
		if (toHiragana(wordJSON.kanji) !== "わかる") {
			typesWithStandardVariations.push(CONJUGATION_TYPES.potential);
		}
		typesWithStandardVariations.push(CONJUGATION_TYPES.tai);
		typesWithStandardVariations.push(CONJUGATION_TYPES.tara);
	} else if (partOfSpeech === PARTS_OF_SPEECH.adjective) {
		if (wordJSON.type === "na") {
			typesWithStandardVariations.push(CONJUGATION_TYPES.tara);
		}
	}

	typesWithStandardVariations.forEach((type) => {
		allConjugations.push(
			getStandardVariationConjugations(wordJSON, partOfSpeech, type, validBaseWordSpellings)
		);
	});

	if (partOfSpeech === PARTS_OF_SPEECH.verb) {
		// te
		allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.te, validBaseWordSpellings, null, null));
		// volitional
		[true, false].forEach((polite) => {
			allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.volitional, validBaseWordSpellings, null, polite));
		});
		// imperative
		allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.imperative, validBaseWordSpellings, null, null));
		// ba (affirmative + negative plain)
		[true, false].forEach((aff) => {
			allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.ba, validBaseWordSpellings, aff, false));
		});
	} else if (partOfSpeech === PARTS_OF_SPEECH.adjective) {
		// adverb
		allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.adverb, validBaseWordSpellings, null, null));
		// ba (affirmative + negative plain)
		[true, false].forEach((aff) => {
			allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.ba, validBaseWordSpellings, aff, false));
		});
		// tara for i/ira adjectives (affirmative + negative plain)
		if (wordJSON.type !== "na") {
			[true, false].forEach((aff) => {
				allConjugations.push(getConjugation(wordJSON, partOfSpeech, CONJUGATION_TYPES.tara, validBaseWordSpellings, aff, false));
			});
		}
	}

	return allConjugations.flat().filter(Boolean);
}
