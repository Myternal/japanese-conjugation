export const PARTS_OF_SPEECH = Object.freeze({
	verb: "verb",
	adjective: "adjective",
});

export const CONJUGATION_TYPES = Object.freeze({
	present: "Present",
	past: "Past",
	te: "て-form",
	adverb: "Adverb",
	volitional: "Volitional",
	passive: "Passive",
	causative: "Causative",
	potential: "Potential",
	imperative: "Imperative",
	causativePassive: "Causative-Passive",
	ba: "ば-form",
	tara: "たら-form",
	tai: "たい-form",
});

// Used to calculate maxScoreObjectsV2.
// When new conjugation types are added, they should be appended to the bottom of this list.
export const orderedMaxScoreSettings = Object.freeze([
	// OG settings
	"verbu",
	"verbru",
	"verbirregular",
	"verbpresent",
	"verbpast",
	"verbte",
	"verbaffirmative",
	"verbnegative",
	"verbplain",
	"verbpolite",
	"adjectivei",
	"adjectivena",
	"adjectiveirregular",
	"adjectivepresent",
	"adjectivepast",
	"adjectiveadverb",
	"adjectiveaffirmative",
	"adjectivenegative",
	"adjectiveplain",
	"adjectivepolite",
	// 7/27/24
	"verbvolitional",
	// 8/9/24
	"verbpassive",
	"verbcausative",
	"verbpotential",
	"verbimperative",
	// 11/29/25
	"verbcausativepassive",
	// 2026 update
	"verbba",
	"verbtara",
	"verbtai",
	"adjectiveba",
	"adjectivetara",
]);

export class MaxScoreObject {
	constructor(score = 0) {
		this.score = score;
	}
}
