import { wordData } from "../wordData.js";

// Additional JLPT N4, N3, N2 verbs and adjectives with transitivity and furigana tags
export const EXTENDED_JLPT_VOCAB = {
	n5: [
		// Baseline from existing wordData + core N5
		...wordData.verbs.slice(0, 35).map((v) => ({ ...v, level: "n5" })),
		...wordData.adjectives.slice(0, 20).map((a) => ({ ...a, level: "n5" })),
	],
	n4: [
		...wordData.verbs.slice(35).map((v) => ({ ...v, level: "n4" })),
		...wordData.adjectives.slice(20).map((a) => ({ ...a, level: "n4" })),
		// Essential N4 additions
		{ kanji: "<ruby>起<rt>お</rt></ruby>こす", type: "u", eng: "wake someone up (transitive)", level: "n4" },
		{ kanji: "<ruby>落<rt>お</rt></ruby>ちる", type: "ru", eng: "fall, drop (intransitive)", level: "n4" },
		{ kanji: "<ruby>落<rt>お</rt></ruby>とす", type: "u", eng: "drop, lose (transitive)", level: "n4" },
		{ kanji: "<ruby>消<rt>き</rt></ruby>える", type: "ru", eng: "go out, vanish (intransitive)", level: "n4" },
		{ kanji: "<ruby>消<rt>け</rt></ruby>す", type: "u", eng: "erase, turn off (transitive)", level: "n4" },
		{ kanji: "<ruby>壊<rt>こわ</rt></ruby>れる", type: "ru", eng: "break (intransitive)", level: "n4" },
		{ kanji: "<ruby>壊<rt>こわ</rt></ruby>す", type: "u", eng: "break, smash (transitive)", level: "n4" },
		{ kanji: "<ruby>閉<rt>し</rt></ruby>まる", type: "u", eng: "close, shut (intransitive)", level: "n4" },
		{ kanji: "<ruby>届<rt>とど</rt></ruby>く", type: "u", eng: "reach, arrive (intransitive)", level: "n4" },
		{ kanji: "<ruby>届<rt>とど</rt></ruby>ける", type: "ru", eng: "deliver (transitive)", level: "n4" },
		{ kanji: "<ruby>直<rt>なお</rt></ruby>る", type: "u", eng: "be repaired, get well (intransitive)", level: "n4" },
		{ kanji: "<ruby>残<rt>のこ</rt></ruby>る", type: "u", eng: "remain, stay (intransitive)", level: "n4" },
		{ kanji: "<ruby>残<rt>のこ</rt></ruby>す", type: "u", eng: "leave behind (transitive)", level: "n4" },
		{ kanji: "<ruby>集<rt>あつ</rt></ruby>まる", type: "u", eng: "gather together (intransitive)", level: "n4" },
		{ kanji: "<ruby>集<rt>あつ</rt></ruby>める", type: "ru", eng: "collect, gather (transitive)", level: "n4" },
		{ kanji: "<ruby>伝<rt>つた</rt></ruby>える", type: "ru", eng: "convey, report", level: "n4" },
		{ kanji: "<ruby>手<rt>て</rt></ruby><ruby>伝<rt>つだ</rt></ruby>う", type: "u", eng: "help, assist", level: "n4" },
		{ kanji: "<ruby>頼<rt>たの</rt></ruby>む", type: "u", eng: "request, ask", level: "n4" },
		{ kanji: "<ruby>断<rt>ことわ</rt></ruby>る", type: "u", eng: "refuse, decline", level: "n4" },
	],
	n3: [
		{ kanji: "<ruby>祈<rt>いの</rt></ruby>る", type: "u", eng: "pray, wish", level: "n3" },
		{ kanji: "<ruby>祝<rt>いわ</rt></ruby>う", type: "u", eng: "celebrate, congratulate", level: "n3" },
		{ kanji: "<ruby>疑<rt>うたが</rt></ruby>う", type: "u", eng: "doubt, suspect", level: "n3" },
		{ kanji: "<ruby>奪<rt>うば</rt></ruby>う", type: "u", eng: "snatch, steal", level: "n3" },
		{ kanji: "<ruby>埋<rt>う</rt></ruby>める", type: "ru", eng: "bury, fill up", level: "n3" },
		{ kanji: "<ruby>追<rt>お</rt></ruby>う", type: "u", eng: "chase, pursue", level: "n3" },
		{ kanji: "<ruby>追<rt>お</rt></ruby>いつく", type: "u", eng: "catch up with", level: "n3" },
		{ kanji: "<ruby>恐<rt>おそ</rt></ruby>れる", type: "ru", eng: "fear, dread", level: "n3" },
		{ kanji: "<ruby>溺<rt>おぼ</rt></ruby>れる", type: "ru", eng: "drown", level: "n3" },
		{ kanji: "<ruby>重<rt>かさ</rt></ruby>なる", type: "u", eng: "pile up, overlap", level: "n3" },
		{ kanji: "<ruby>抱<rt>かか</rt></ruby>える", type: "ru", eng: "hold in arms, burden", level: "n3" },
		{ kanji: "<ruby>限<rt>かぎ</rt></ruby>る", type: "u", eng: "limit, restrict", level: "n3" },
		{ kanji: "<ruby>隠<rt>かく</rt></ruby>す", type: "u", eng: "hide, conceal", level: "n3" },
		{ kanji: "<ruby>枯<rt>か</rt></ruby>れる", type: "ru", eng: "wither, die (plant)", level: "n3" },
		{ kanji: "<ruby>逆<rt>さか</rt></ruby>らう", type: "u", eng: "oppose, go against", level: "n3" },
		{ kanji: "<ruby>騒<rt>さわ</rt></ruby>ぐ", type: "u", eng: "make noise, clamor", level: "n3" },
		{ kanji: "<ruby>優<rt>すぐ</rt></ruby>れる", type: "ru", eng: "surpass, excel", level: "n3" },
		{ kanji: "<ruby>倒<rt>たお</rt></ruby>れる", type: "ru", eng: "collapse, fall over", level: "n3" },
		{ kanji: "<ruby>抱<rt>だ</rt></ruby>く", type: "u", eng: "embrace, hold", level: "n3" },
		{ kanji: "<ruby>捕<rt>つか</rt></ruby>まえる", type: "ru", eng: "catch, arrest", level: "n3" },
		{ kanji: "<ruby>防<rt>ふせ</rt></ruby>ぐ", type: "u", eng: "defend, prevent", level: "n3" },
		{ kanji: "<ruby>招<rt>まね</rt></ruby>く", type: "u", eng: "invite, summon", level: "n3" },
		{ kanji: "<ruby>雇<rt>やと</rt></ruby>う", type: "u", eng: "employ, hire", level: "n3" },
		{ kanji: "<ruby>汚<rt>よご</rt></ruby>す", type: "u", eng: "soil, make dirty", level: "n3" },
		{ kanji: "<ruby>分<rt>わ</rt></ruby>ける", type: "ru", eng: "divide, separate", level: "n3" },
		{ kanji: "<ruby>辛<rt>から</rt></ruby>い", type: "i", eng: "spicy, hot", level: "n3" },
		{ kanji: "<ruby>苦<rt>にが</rt></ruby>い", type: "i", eng: "bitter", level: "n3" },
		{ kanji: "<ruby>深<rt>ふか</rt></ruby>い", type: "i", eng: "deep", level: "n3" },
		{ kanji: "<ruby>浅<rt>あさ</rt></ruby>い", type: "i", eng: "shallow", level: "n3" },
		{ kanji: "<ruby>激<rt>はげ</rt></ruby>しい", type: "i", eng: "intense, violent", level: "n3" },
	],
	n2: [
		{ kanji: "<ruby>焦<rt>あせ</rt></ruby>る", type: "u", eng: "feel rushed, panic", level: "n2" },
		{ kanji: "<ruby>従<rt>したが</rt></ruby>う", type: "u", eng: "obey, comply with", level: "n2" },
		{ kanji: "<ruby>遮<rt>さえぎ</rt></ruby>る", type: "u", eng: "interrupt, block", level: "n2" },
		{ kanji: "<ruby>促<rt>うなが</rt></ruby>す", type: "u", eng: "urge, prompt", level: "n2" },
		{ kanji: "<ruby>費<rt>つい</rt></ruby>やす", type: "u", eng: "spend, devote", level: "n2" },
		{ kanji: "<ruby>欺<rt>あざむ</rt></ruby>く", type: "u", eng: "deceive, trick", level: "n2" },
		{ kanji: "<ruby>恨<rt>うら</rt></ruby>む", type: "u", eng: "bear a grudge against", level: "n2" },
		{ kanji: "<ruby>敬<rt>うやま</rt></ruby>う", type: "u", eng: "respect, honor", level: "n2" },
		{ kanji: "<ruby>慰<rt>なぐさ</rt></ruby>める", type: "ru", eng: "comfort, console", level: "n2" },
		{ kanji: "<ruby>怠<rt>なま</rt></ruby>ける", type: "ru", eng: "be lazy, neglect", level: "n2" },
		{ kanji: "<ruby>免<rt>まぬか</rt></ruby>れる", type: "ru", eng: "escape, be spared", level: "n2" },
		{ kanji: "<ruby>塞<rt>ふさ</rt></ruby>ぐ", type: "u", eng: "stop up, block", level: "n2" },
		{ kanji: "<ruby>陥<rt>おちい</rt></ruby>る", type: "u", eng: "fall into, cave in", level: "n2" },
		{ kanji: "<ruby>脅<rt>おびや</rt></ruby>かす", type: "u", eng: "threaten, menace", level: "n2" },
		{ kanji: "<ruby>覆<rt>くつがえ</rt></ruby>す", type: "u", eng: "overturn, overthrow", level: "n2" },
		{ kanji: "<ruby>惜<rt>お</rt></ruby>しい", type: "i", eng: "regrettable, precious", level: "n2" },
		{ kanji: "<ruby>険<rt>けわ</rt></ruby>しい", type: "i", eng: "steep, grim", level: "n2" },
		{ kanji: "<ruby>煩<rt>わずら</rt></ruby>わしい", type: "i", eng: "troublesome, burdensome", level: "n2" },
	],
};

/**
 * Parses user-pasted text (comma, newline, or tab separated) into verb/adjective objects
 * Ex: "食べる, 飲む, 行く" or "食べる\teat\n飲む\tdrink"
 */
export function parseCustomWordList(rawText) {
	if (!rawText || !rawText.trim()) return [];

	const lines = rawText
		.split(/[\n,;]+/)
		.map((s) => s.trim())
		.filter(Boolean);

	const parsed = [];

	for (const line of lines) {
		const parts = line.split(/[\t|]+/).map((p) => p.trim());
		const word = parts[0];
		const eng = parts[1] || "";

		if (!word) continue;

		// Deduce verb/adj type
		let type = "u";
		if (word.endsWith("する")) {
			type = "irv";
		} else if (word.endsWith("くる") || word.endsWith("来る")) {
			type = "irv";
		} else if (word === "行く" || word === "いく") {
			type = "irv";
		} else if (word === "ある") {
			type = "irv";
		} else if (word.endsWith("い") && !word.endsWith("る")) {
			type = word === "いい" || word.endsWith("かっこいい") ? "ira" : "i";
		} else if (word.endsWith("る")) {
			// Check if preceding vowel is e or i for ichidan heuristic
			const pre = word.charAt(word.length - 2);
			const isIchidanCandidate = /[いきしちにひみりぎじぢびぴえけせてねへめれげぜでべぺ]/.test(pre);
			type = isIchidanCandidate ? "ru" : "u";
		} else {
			type = "u";
		}

		parsed.push({
			kanji: word,
			type,
			eng: eng || "Custom word",
			level: "custom",
		});
	}

	return parsed;
}

export function formatVocabAsWordsObject(items) {
	const verbs = [];
	const adjectives = [];
	for (const item of items) {
		if (item.type === "u" || item.type === "ru" || item.type === "irv") {
			verbs.push(item);
		} else {
			adjectives.push(item);
		}
	}
	return { verbs, adjectives };
}

export function getVocabForLevel(level = "all", customWords = []) {
	let list = [];
	if (level === "custom") {
		list = customWords.length > 0 ? customWords : EXTENDED_JLPT_VOCAB.n4;
	} else if (level === "n5") {
		list = EXTENDED_JLPT_VOCAB.n5;
	} else if (level === "n4") {
		list = [...EXTENDED_JLPT_VOCAB.n5, ...EXTENDED_JLPT_VOCAB.n4];
	} else if (level === "n3") {
		list = [
			...EXTENDED_JLPT_VOCAB.n5,
			...EXTENDED_JLPT_VOCAB.n4,
			...EXTENDED_JLPT_VOCAB.n3,
		];
	} else if (level === "n2") {
		list = [
			...EXTENDED_JLPT_VOCAB.n5,
			...EXTENDED_JLPT_VOCAB.n4,
			...EXTENDED_JLPT_VOCAB.n3,
			...EXTENDED_JLPT_VOCAB.n2,
		];
	} else {
		list = [
			...EXTENDED_JLPT_VOCAB.n5,
			...EXTENDED_JLPT_VOCAB.n4,
			...EXTENDED_JLPT_VOCAB.n3,
			...EXTENDED_JLPT_VOCAB.n2,
			...customWords,
		];
	}
	return list;
}

export function getVocabObjectForLevel(level = "all", customWords = []) {
	const list = getVocabForLevel(level, customWords);
	return formatVocabAsWordsObject(list);
}

