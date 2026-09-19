import { wordData } from "../wordData.js";
import { toHiragana } from "../engine/conjugator.js";

// Core JLPT N5 words partitioning
const n5VerbKanji = new Set([
	"<ruby>行<rt>い</rt></ruby>く",
	"する",
	"<ruby>来<rt>く</rt></ruby>る",
	"ある",
	"いる",
	"<ruby>食<rt>た</rt></ruby>べる",
	"<ruby>起<rt>お</rt></ruby>きる",
	"<ruby>出<rt>で</rt></ruby>る",
	"<ruby>見<rt>み</rt></ruby>る",
	"<ruby>開<rt>あ</rt></ruby>ける",
	"<ruby>寝<rt>ね</rt></ruby>る",
	"<ruby>閉<rt>し</rt></ruby>める",
	"<ruby>着<rt>き</rt></ruby>る",
	"<ruby>降<rt>お</rt></ruby>りる",
	"あげる",
	"<ruby>忘<rt>わす</rt></ruby>れる",
	"<ruby>覚<rt>おぼ</rt></ruby>える",
	"<ruby>飲<rt>の</rt></ruby>む",
	"<ruby>買<rt>か</rt></ruby>う",
	"<ruby>会<rt>あ</rt></ruby>う",
	"<ruby>言<rt>い</rt></ruby>う",
	"<ruby>待<rt>ま</rt></ruby>つ",
	"<ruby>立<rt>た</rt></ruby>つ",
	"<ruby>聞<rt>き</rt></ruby>く",
	"<ruby>歩<rt>ある</rt></ruby>く",
	"<ruby>書<rt>か</rt></ruby>く",
	"<ruby>読<rt>よ</rt></ruby>む",
	"<ruby>休<rt>やす</rt></ruby>む",
	"<ruby>遊<rt>あそ</rt></ruby>ぶ",
	"<ruby>話<rt>はな</rt></ruby>す",
	"<ruby>泳<rt>およ</rt></ruby>ぐ",
	"<ruby>帰<rt>かえ</rt></ruby>る",
	"<ruby>乗<rt>の</rt></ruby>る",
	"<ruby>知<rt>し</rt></ruby>る",
	"<ruby>作<rt>つく</rt></ruby>る",
	"なる",
	"<ruby>分<rt>わ</rt></ruby>かる",
	"<ruby>取<rt>と</rt></ruby>る",
	"<ruby>使<rt>つか</rt></ruby>う",
	"<ruby>持<rt>も</rt></ruby>つ",
	"<ruby>終<rt>お</rt></ruby>わる",
	"<ruby>死<rt>し</rt></ruby>ぬ",
	"<ruby>勉<rt>べん</rt></ruby><ruby>強<rt>きょう</rt></ruby>する",
]);

const n5AdjKanji = new Set([
	"いい",
	"かっこいい",
	"<ruby>赤<rt>あか</rt></ruby>い",
	"<ruby>新<rt>あたら</rt></ruby>しい",
	"<ruby>暑<rt>あつ</rt></ruby>い",
	"<ruby>危<rt>あぶ</rt></ruby>ない",
	"<ruby>美<rt>お</rt></ruby><ruby>味<rt>い</rt></ruby>しい",
	"<ruby>大<rt>おお</rt></ruby>きい",
	"<ruby>遅<rt>おそ</rt></ruby>い",
	"<ruby>面<rt>おも</rt></ruby><ruby>白<rt>しろ</rt></ruby>い",
	"<ruby>可<rt>か</rt></ruby><ruby>愛<rt>わい</rt></ruby>い",
	"<ruby>寒<rt>さむ</rt></ruby>い",
	"<ruby>高<rt>たか</rt></ruby>い",
	"<ruby>楽<rt>たの</rt></ruby>しい",
	"<ruby>小<rt>ちい</rt></ruby>さい",
	"<ruby>速<rt>はや</rt></ruby>い",
	"<ruby>古<rt>ふる</rt></ruby>い",
	"<ruby>欲<rt>ほ</rt></ruby>しい",
	"<ruby>安<rt>やす</rt></ruby>い",
	"<ruby>好<rt>す</rt></ruby>き",
	"きれい",
	"<ruby>嫌<rt>きら</rt></ruby>い",
	"<ruby>静<rt>しず</rt></ruby>か",
	"<ruby>元<rt>げん</rt></ruby><ruby>気<rt>き</rt></ruby>",
	"<ruby>有<rt>ゆう</rt></ruby><ruby>名<rt>めい</rt></ruby>",
	"<ruby>色<rt>いろ</rt></ruby><ruby>々<rt>いろ</rt></ruby>",
	"<ruby>大<rt>だい</rt></ruby><ruby>丈<rt>じょう</rt></ruby><ruby>夫<rt>ぶ</rt></ruby>",
	"<ruby>下<rt>へ</rt></ruby><ruby>手<rt>た</rt></ruby>",
]);

// Additional JLPT N4, N3, N2 verbs and adjectives with transitivity and furigana tags
export const EXTENDED_JLPT_VOCAB = {
	n5: [
		// Baseline from existing wordData + core N5
		...wordData.verbs.filter((v) => n5VerbKanji.has(v.kanji)).map((v) => ({ ...v, level: "n5" })),
		...wordData.adjectives.filter((a) => n5AdjKanji.has(a.kanji)).map((a) => ({ ...a, level: "n5" })),
	],
	n4: [
		...wordData.verbs.filter((v) => !n5VerbKanji.has(v.kanji)).map((v) => ({ ...v, level: "n4" })),
		...wordData.adjectives.filter((a) => !n5AdjKanji.has(a.kanji)).map((a) => ({ ...a, level: "n4" })),
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

function convertBracketsToRuby(str) {
	return str.replace(/([一-龯々]+)\[([ぁ-んァ-ヶー]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>");
}

let knownWordsMap = null;
function getKnownWord(cleanWord) {
	if (!knownWordsMap) {
		knownWordsMap = new Map();
		const allPredefined = [
			...EXTENDED_JLPT_VOCAB.n5,
			...EXTENDED_JLPT_VOCAB.n4,
			...EXTENDED_JLPT_VOCAB.n3,
			...EXTENDED_JLPT_VOCAB.n2,
		];
		for (const item of allPredefined) {
			const plain = item.kanji.replace(/<ruby>|<\/ruby>|<rt>.*?<\/rt>/g, "");
			if (!knownWordsMap.has(plain)) {
				knownWordsMap.set(plain, item);
			}
			const kana = toHiragana(item.kanji);
			if (kana && !knownWordsMap.has(kana)) {
				knownWordsMap.set(kana, item);
			}
		}
		// Alias for 良い -> いい
		const iiWord = allPredefined.find((i) => i.kanji === "いい");
		if (iiWord && !knownWordsMap.has("良い")) {
			knownWordsMap.set("良い", { ...iiWord, kanji: "良い" });
		}

		// Aliases for かっこいい / 格好いい / 格好良い / かっこ良い
		const kakkoiiWord = allPredefined.find((i) => i.kanji === "かっこいい");
		if (kakkoiiWord) {
			for (const alt of ["格好いい", "格好良い", "かっこ良い"]) {
				if (!knownWordsMap.has(alt)) {
					knownWordsMap.set(alt, {
						...kakkoiiWord,
						kanji: alt,
						altOkurigana: ["かっこいい", "格好いい", "かっこ良い", "格好良い"],
					});
				}
			}
		}
	}
	if (knownWordsMap.has(cleanWord)) {
		return knownWordsMap.get(cleanWord);
	}
	// Fallback for na-adjectives entered with trailing な (e.g. 静かな -> 静か)
	if (cleanWord.endsWith("な") && cleanWord.length > 1) {
		const stem = cleanWord.slice(0, -1);
		const candidate = knownWordsMap.get(stem);
		if (candidate && candidate.type === "na") {
			return candidate;
		}
	}
	return undefined;
}

/**
 * Parses user-pasted text (comma, newline, tab, or Anki format) into verb/adjective objects
 * Ex: "食べる, 飲む, 行く", "食[た]べる\teat", or "食べる - to eat"
 */
export function parseCustomWordList(rawText) {
	if (!rawText || !rawText.trim()) return [];

	const lines = rawText
		.split(/[\n,;、；]+/)
		.map((s) => s.trim())
		.filter(Boolean);

	const parsed = [];

	for (const line of lines) {
		const parts = line.split(/[\t|]|\s+[:\-–—]\s+/).map((p) => p.trim());
		let word = parts[0];
		const eng = parts[1] || "";

		if (!word) continue;

		// 1. If user provided Anki bracket notation like 食[た]べる
		if (/\[[ぁ-んァ-ヶー]+\]/.test(word)) {
			word = convertBracketsToRuby(word);
		}

		const plainWord = word.replace(/<ruby>|<\/ruby>|<rt>.*?<\/rt>/g, "");

		// 2. If it's a known dictionary word without ruby tags, adopt full ruby furigana
		const known = getKnownWord(plainWord);
		let finalKanji = word;
		let type = known ? known.type : "u";
		let meaning = eng;

		if (known) {
			if (!word.includes("<ruby>")) {
				finalKanji = known.kanji;
			}
			if (!meaning) {
				meaning = known.eng;
			}
		} else {
			// Deduce verb/adj type from plain text
			if (plainWord.endsWith("する")) {
				type = "irv";
			} else if (plainWord.endsWith("くる") || plainWord.endsWith("来る")) {
				type = "irv";
			} else if (plainWord.endsWith("行く") || plainWord.endsWith("いく")) {
				type = "irv";
			} else if (plainWord === "ある") {
				type = "irv";
			} else if (plainWord.endsWith("い") && !plainWord.endsWith("る")) {
				const isIra =
					plainWord === "いい" ||
					plainWord === "良い" ||
					plainWord.endsWith("かっこいい") ||
					plainWord.endsWith("かっこ良い") ||
					plainWord.endsWith("格好いい") ||
					plainWord.endsWith("格好良い") ||
					plainWord.endsWith("気持ちいい") ||
					plainWord.endsWith("気持ち良い") ||
					plainWord.endsWith("きもちいい");
				type = isIra ? "ira" : "i";
			} else if (plainWord.endsWith("な") && !plainWord.endsWith("ない") && plainWord.length > 1) {
				type = "na";
				finalKanji = finalKanji.replace(/な$/, "");
			} else if (plainWord.endsWith("る")) {
				const pre = plainWord.charAt(plainWord.length - 2);
				const isIchidanCandidate = /[いきしちにひみりぎじぢびぴえけせてねへめれげぜでべぺ]/.test(pre);
				type = isIchidanCandidate ? "ru" : "u";
			} else {
				type = "u";
			}
		}

		const customEntry = {
			kanji: finalKanji,
			type,
			eng: meaning || "Custom word",
			level: "custom",
		};

		if (known?.group) {
			customEntry.group = known.group;
		} else if (plainWord.endsWith("行く") || plainWord.endsWith("いく")) {
			customEntry.group = "iku";
		} else if (plainWord.endsWith("する")) {
			customEntry.group = "suru";
		}

		if (known?.altOkurigana) {
			customEntry.altOkurigana = [...known.altOkurigana];
		}

		parsed.push(customEntry);
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

