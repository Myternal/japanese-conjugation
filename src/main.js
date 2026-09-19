"use strict";
import { bind, isJapanese } from "wanakana";
import {
	CONDITIONAL_UI_TIMINGS,
	getDefaultSettings,
	showFurigana,
	showTranslation,
	applyAllSettingsFilterWords,
	applyNonConjugationSettings,
	optionsMenuInit,
	selectCheckboxesInUi,
	showHideOptionsAndCheckErrors,
	insertSettingsFromUi,
	getDefaultAdditiveSettings,
	calculateMaxScoreIndex,
	convertMaxScoreObjectsToV2,
} from "./settingManagement.js";
import { wordData } from "./wordData.js";
import { CONJUGATION_TYPES, PARTS_OF_SPEECH } from "./constants.js";
import { toggleDisplayNone, toggleBackgroundNone } from "./utils.js";
import {
	getAllConjugations,
	toKanjiPlusHiragana,
	toHiragana,
	dropFinalLetter,
} from "./engine/conjugator.js";
import { sfx } from "./engine/soundEffects.js";
import { GAME_MODES, SessionManager } from "./engine/gameModes.js";
import { generateDokkaiChallenge } from "./engine/deconjugator.js";
import {
	getVocabObjectForLevel,
	getVocabForLevel,
	parseCustomWordList,
} from "./data/vocabData.js";
import {
	generateSyncUrl,
	checkUrlForSyncImport,
	pushToGitHubGist,
	pullFromGitHubGist,
	autoConnectGitHub,
	disconnectGitHub,
	isCloudConnected,
	silentPullOnStartup,
	triggerAutoSync,
} from "./engine/syncManager.js";

const isTouch = "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
document.getElementById("press-any-key-text").textContent = isTouch
	? "Tap to continue"
	: "Press Enter/Return to continue";

const SCREENS = Object.freeze({
	question: 0,
	results: 1,
	settings: 2,
});

function wordTypeToDisplayText(type) {
	if (type === "u") return "う-verb";
	if (type === "ru") return "る-verb";
	if (type === "irv" || type === "ira") return "Irregular";
	if (type === "i") return "い-adjective";
	if (type === "na") return "な-adjective";
	return "";
}

function conjugationInqueryFormatting(conjugation) {
	const tags = [];

	// Main conjugation type tag
	let formLabel = "";
	if (conjugation.type === CONJUGATION_TYPES.present) {
		formLabel = "Présent";
	} else if (conjugation.type === CONJUGATION_TYPES.past) {
		formLabel = "Passé";
	} else if (conjugation.type === CONJUGATION_TYPES.te) {
		formLabel = "Forme en 〜て";
	} else if (conjugation.type === CONJUGATION_TYPES.adverb) {
		formLabel = "Adverbe";
	} else if (conjugation.type === CONJUGATION_TYPES.volitional) {
		formLabel = "Volitionnel (〜よう)";
	} else if (conjugation.type === CONJUGATION_TYPES.passive) {
		formLabel = "Passif (〜られる)";
	} else if (conjugation.type === CONJUGATION_TYPES.causative) {
		formLabel = "Causatif (〜させる)";
	} else if (conjugation.type === CONJUGATION_TYPES.potential) {
		formLabel = "Potentiel (〜る / られる)";
	} else if (conjugation.type === CONJUGATION_TYPES.imperative) {
		formLabel = "Impératif";
	} else if (conjugation.type === CONJUGATION_TYPES.causativePassive) {
		formLabel = "Causatif-Passif (〜させられる)";
	} else if (conjugation.type === CONJUGATION_TYPES.ba) {
		formLabel = "Conditionnel 〜ば";
	} else if (conjugation.type === CONJUGATION_TYPES.tara) {
		formLabel = "Conditionnel 〜たら";
	} else if (conjugation.type === CONJUGATION_TYPES.tai) {
		formLabel = "Désiratif 〜たい";
	}

	if (formLabel) {
		tags.push(`<span class="inquery-tag form-tag">${formLabel}</span>`);
	}

	// Polarity tag (affirmative / negative)
	if (conjugation.affirmative === false) {
		tags.push(`<span class="inquery-tag polarity-negative">Négatif</span>`);
	} else if (conjugation.affirmative === true && conjugation.type !== CONJUGATION_TYPES.te) {
		tags.push(`<span class="inquery-tag polarity-affirmative">Affirmatif</span>`);
	}

	// Politeness tag (polite / plain)
	if (conjugation.polite === true) {
		tags.push(`<span class="inquery-tag politeness-polite">Poli</span>`);
	} else if (conjugation.polite === false) {
		tags.push(`<span class="inquery-tag politeness-plain">Neutre</span>`);
	}

	return `<div class="conjugation-inquery">${tags.join("")}</div>`;
}

function changeVerbBoxFontColor(color) {
	const ps = document.getElementById("verb-box").getElementsByTagName("p");
	for (const p of Array.from(ps)) {
		p.style.color = color;
	}
}

function updateCurrentWord(word) {
	toggleBackgroundNone(document.getElementById("verb-box"), true);
	const verbHtml = word.wordJSON.kanji
		.replaceAll("<rt>", '<span class="rt">')
		.replaceAll("</rt>", "</span>");
	document.getElementById("verb-text").innerHTML = verbHtml;
	document.getElementById("translation").textContent = word.wordJSON.eng;
	document.getElementById("verb-type").textContent = "\u00A0";
	document.getElementById("conjugation-inquery-text").innerHTML =
		conjugationInqueryFormatting(word.conjugation);
}

function loadNewWord(wordList) {
	const word = pickRandomWord(wordList);
	updateCurrentWord(word);
	changeVerbBoxFontColor("rgb(232, 232, 232)");
	return word;
}

// Probability & Words Management
export class Word {
	constructor(wordJSON, conjugation) {
		this.wordJSON = wordJSON;
		this.conjugation = conjugation;
		this.probability = 0;
		this.wasRecentlyIncorrect = false;
	}
}

class WordRecentlySeen {
	constructor(word, wasCorrect) {
		this.word = word;
		this.wasCorrect = wasCorrect;
	}
}

function findMinProb(currentWords) {
	let min = 2;
	for (let i = 0; i < currentWords.length; i++) {
		min = currentWords[i].probability < min && currentWords[i].probability !== 0
			? currentWords[i].probability
			: min;
	}
	return min;
}

function normalizeProbabilities(currentWords) {
	let totalProbability = 0;
	for (let i = 0; i < currentWords.length; i++) {
		totalProbability += currentWords[i].probability;
	}
	if (totalProbability > 0) {
		for (let i = 0; i < currentWords.length; i++) {
			currentWords[i].probability /= totalProbability;
		}
	}
}

function setAllProbabilitiesToValue(currentWords, value) {
	for (let i = 0; i < currentWords.length; i++) {
		currentWords[i].probability = value;
	}
}

function equalizeProbabilities(currentWords) {
	setAllProbabilitiesToValue(currentWords, 1);
	normalizeProbabilities(currentWords);
}

function updateProbabilites(currentWords, wordsRecentlySeenQueue, currentWord, currentWordWasCorrect) {
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
		const currentMinProb = findMinProb(currentWords);
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

function createWordList(JSONWords) {
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

function pickRandomWord(wordList) {
	let random = Math.random();
	try {
		for (let i = 0; i < wordList.length; i++) {
			if (random < wordList[i].probability) {
				return wordList[i];
			}
			random -= wordList[i].probability;
		}
		return wordList[0];
	} catch (err) {
		return wordList[0];
	}
}

function addToScore(amount = 1, maxScoreObjects, maxScoreIndex) {
	if (amount === 0) return;
	const max = document.getElementById("max-streak-text");
	const current = document.getElementById("current-streak-text");

	if (parseInt(max.textContent || "0") <= parseInt(current.textContent || "0")) {
		const newAmount = parseInt(max.textContent || "0") + amount;
		max.textContent = newAmount;
		if (!document.getElementById("max-streak").classList.contains("display-none")) {
			max.classList.add("grow-animation");
		}

		if (maxScoreObjects[maxScoreIndex]) {
			maxScoreObjects[maxScoreIndex].score = newAmount;
			localStorage.setItem("maxScoreObjectsV2", JSON.stringify(maxScoreObjects));
		}
	}

	current.textContent = parseInt(current.textContent || "0") + amount;
	if (!document.getElementById("current-streak").classList.contains("display-none")) {
		current.classList.add("grow-animation");
	}
}

function typeToWordBoxColor(type) {
	switch (type) {
		case "u": return "rgb(255, 125, 0)";
		case "ru": return "rgb(5, 80, 245)";
		case "irv":
		case "ira": return "gray";
		case "i": return "rgb(0, 180, 240)";
		case "na": return "rgb(143, 73, 40)";
		default: return "gray";
	}
}

function updateStatusBoxes(word, entryText) {
	const statusBox = document.getElementById("status-box");
	toggleDisplayNone(statusBox, false);

	if (word.conjugation.validAnswers.some((e) => e === entryText)) {
		statusBox.style.background = "green";
		const subConjugationForm = getSubConjugationForm(word, entryText);
		document.getElementById("status-text").innerHTML = `Correct${
			subConjugationForm != null
				? '<span class="sub-conjugation-indicator">(' + subConjugationForm + ")</span>"
				: ""
		}<br>${entryText} ○`;
	} else {
		document.getElementById("verb-box").style.background = typeToWordBoxColor(word.wordJSON.type);
		toggleBackgroundNone(document.getElementById("verb-box"), false);
		changeVerbBoxFontColor("white");
		document.getElementById("verb-type").textContent = wordTypeToDisplayText(word.wordJSON.type);

		statusBox.style.background = "rgb(218, 5, 5)";
		document.getElementById("status-text").innerHTML =
			(entryText === "" ? "_" : entryText) +
			" ×<br>" +
			word.conjugation.validAnswers[0] +
			" ○";
	}
}

function getSubConjugationForm(word, validAnswer) {
	const kanjiWord = toKanjiPlusHiragana(word.wordJSON.kanji);
	const hiraganaWord = toHiragana(word.wordJSON.kanji);

	if (
		word.conjugation.type === CONJUGATION_TYPES.potential &&
		(word.wordJSON.type === "ru" || kanjiWord === "来る")
	) {
		const shortFormStems = [];
		shortFormStems.push(dropFinalLetter(kanjiWord) + "れ");
		if (word.wordJSON.type === "ru") {
			shortFormStems.push(dropFinalLetter(hiraganaWord) + "れ");
		} else if (kanjiWord === "来る") {
			shortFormStems.push("これ");
		}

		if (shortFormStems.some((stem) => validAnswer.startsWith(stem))) {
			return "ら-omitted short form";
		}
	}
	return null;
}

export class MaxScoreObject {
	constructor(score) {
		this.score = score;
	}
}

// Main ConjugationApp Controller
class ConjugationApp {
	constructor(words) {
		const mainInput = document.getElementById("main-text-input");
		bind(mainInput);

		// Initialize Custom Vocab & Level
		this.customWords = [];
		const storedCustom = localStorage.getItem("dojoCustomVocab");
		if (storedCustom) {
			try {
				this.customWords = JSON.parse(storedCustom);
			} catch (e) {}
		}
		this.selectedLevel = localStorage.getItem("dojoSelectedLevel") || "all";

		// Check for instant URL sync import
		const importedSync = checkUrlForSyncImport();
		if (importedSync) {
			setTimeout(() => {
				alert("Progression et réglages importés avec succès.");
			}, 300);
		}

		// Initialize Session Manager for Arcade Modes
		this.session = new SessionManager({
			onTick: (seconds) => {
				const el = document.getElementById("timer-text");
				if (el) el.textContent = seconds + "s";
				if (seconds <= 5 && seconds > 0) sfx.playTick();
			},
			onReactionSpeed: (speedTag) => {
				const reactionBadge = document.getElementById("reaction-badge");
				const reactionText = document.getElementById("reaction-text");
				if (reactionText && reactionBadge) {
					reactionText.textContent = `${(speedTag.ms / 1000).toFixed(1)}s (${speedTag.text})`;
					reactionBadge.className = `hud-badge ${speedTag.class}`;
				}
			},
			onSessionEnd: (summary) => {
				this.showSessionModal(summary);
				triggerAutoSync();
			},
		});

		this.initState(words);
		this.setupEventListeners();
		this.setupDojoControls();

		// Option A: 100% Cloud-First silent pull on startup
		silentPullOnStartup()
			.then((remotePayload) => {
				if (remotePayload) {
					this.initState(words);
					const cloudStatusBadge = document.getElementById("cloud-status-indicator");
					if (cloudStatusBadge) {
						cloudStatusBadge.textContent = "Synchro OK";
						cloudStatusBadge.classList.add("speed-fast");
						setTimeout(() => {
							cloudStatusBadge.textContent = "Cloud";
							cloudStatusBadge.classList.remove("speed-fast");
						}, 2000);
					}
				}
			})
			.catch((err) => {
				console.warn("Silent cloud pull error:", err);
			});

		optionsMenuInit();
	}

	setupEventListeners() {
		const mainInput = document.getElementById("main-text-input");
		mainInput.addEventListener("keydown", (e) => this.inputKeyPress(e));
		document.getElementById("options-button").addEventListener("click", (e) => this.settingsButtonClicked(e));
		document.getElementById("options-form").addEventListener("submit", (e) => this.backButtonClicked(e));

		document.addEventListener("keydown", this.onKeyDown.bind(this));
		document.addEventListener("touchend", this.onTouchEnd.bind(this));
	}

	setupDojoControls() {
		// Mode switcher buttons
		const modeBtns = document.querySelectorAll(".mode-btn");
		modeBtns.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const mode = e.currentTarget.getAttribute("data-mode");
				this.switchMode(mode);
			});
		});

		// Sound toggle button
		const soundBtn = document.getElementById("sound-toggle-btn");
		if (soundBtn) {
			soundBtn.textContent = sfx.isMuted() ? "Son : OFF" : "Son : ON";
			soundBtn.addEventListener("click", () => {
				const muted = sfx.toggleMute();
				soundBtn.textContent = muted ? "Son : OFF" : "Son : ON";
			});
		}

		// Dokkai Flash multiple-choice buttons
		const dokkaiBtns = document.querySelectorAll(".dokkai-btn");
		dokkaiBtns.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
				this.handleDokkaiChoice(idx);
			});
		});

		// Modal buttons
		document.getElementById("modal-restart-btn").addEventListener("click", () => {
			this.closeSessionModal();
			this.switchMode(this.session.mode);
		});
		document.getElementById("modal-close-btn").addEventListener("click", () => {
			this.closeSessionModal();
			this.switchMode(GAME_MODES.CLASSIC);
		});
		document.getElementById("copy-mistakes-btn").addEventListener("click", () => {
			const tsv = this.session.exportMistakesTSV();
			if (navigator.clipboard) {
				navigator.clipboard.writeText(tsv).then(() => {
					const feedback = document.getElementById("copy-feedback");
					toggleDisplayNone(feedback, false);
					setTimeout(() => toggleDisplayNone(feedback, true), 2500);
				});
			}
		});

		// Level Presets
		const presetBtns = document.querySelectorAll(".preset-btn");
		presetBtns.forEach((btn) => {
			if (btn.getAttribute("data-level") === this.selectedLevel) {
				presetBtns.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
			}
			btn.addEventListener("click", (e) => {
				presetBtns.forEach((b) => b.classList.remove("active"));
				e.currentTarget.classList.add("active");
				const level = e.currentTarget.getAttribute("data-level");
				this.setVocabLevel(level);
			});
		});

		// Custom Vocab Importer
		const applyCustomBtn = document.getElementById("apply-custom-vocab-btn");
		if (applyCustomBtn) {
			applyCustomBtn.addEventListener("click", () => {
				const text = document.getElementById("custom-vocab-input").value;
				const parsed = parseCustomWordList(text);
				const statusEl = document.getElementById("custom-vocab-status");
				if (parsed.length > 0) {
					this.customWords = parsed;
					localStorage.setItem("dojoCustomVocab", JSON.stringify(parsed));
					statusEl.textContent = `${parsed.length} mot(s) chargé(s) avec succès.`;
					this.setVocabLevel("custom");
				} else {
					statusEl.textContent = "Aucun mot valide détecté.";
				}
			});
		}

		// Instant QR Code & Magic Link Transfer
		const qrImg = document.getElementById("qr-code-img");
		const btnShowQr = document.getElementById("btn-show-qr");
		if (btnShowQr && qrImg) {
			btnShowQr.addEventListener("click", () => {
				const url = generateSyncUrl();
				qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(url);
				qrImg.style.display = "block";
			});
		}

		const btnCopySyncUrl = document.getElementById("btn-copy-sync-url");
		if (btnCopySyncUrl) {
			btnCopySyncUrl.addEventListener("click", () => {
				const url = generateSyncUrl();
				if (navigator.clipboard) {
					navigator.clipboard.writeText(url).then(() => {
						const feedback = document.getElementById("sync-url-feedback");
						toggleDisplayNone(feedback, false);
						setTimeout(() => toggleDisplayNone(feedback, true), 2500);
					});
				}
			});
		}

		// 100% Cloud-First GitHub Gist Auto-Sync
		const cloudStatusBadge = document.getElementById("cloud-status-indicator");
		const cloudConnectBox = document.getElementById("cloud-connect-box");
		const cloudConnectedBox = document.getElementById("cloud-connected-box");
		const gistTokenInput = document.getElementById("gist-token-input");
		const gistStatusMsg = document.getElementById("gist-status-msg");

		const refreshCloudUi = () => {
			const connected = isCloudConnected();
			if (cloudStatusBadge) {
				cloudStatusBadge.textContent = connected ? "Cloud" : "Local";
				cloudStatusBadge.style.color = connected ? "#00e676" : "#aaa";
				cloudStatusBadge.title = connected
					? "Mode Cloud activé (synchronisation automatique)"
					: "Stockage local (non connecté au Cloud)";
			}
			if (cloudConnectBox && cloudConnectedBox) {
				toggleDisplayNone(cloudConnectedBox, !connected);
				toggleDisplayNone(cloudConnectBox, connected);
			}
		};

		refreshCloudUi();

		document.getElementById("btn-cloud-connect")?.addEventListener("click", async () => {
			const token = gistTokenInput.value.trim();
			if (!token) {
				gistStatusMsg.textContent = "Veuillez renseigner votre token GitHub.";
				gistStatusMsg.style.color = "#ff8a80";
				return;
			}
			gistStatusMsg.textContent = "Connexion au Cloud en cours...";
			gistStatusMsg.style.color = "#ffeb3b";
			try {
				const res = await autoConnectGitHub(token);
				refreshCloudUi();
				gistStatusMsg.textContent = res.isNew
					? "Nouveau Gist créé et synchronisé avec succès."
					: "Gist synchronisé avec succès.";
				gistStatusMsg.style.color = "#00e676";
				this.initState(wordData);
				triggerAutoSync();
			} catch (err) {
				gistStatusMsg.textContent = `Erreur : ${err.message}`;
				gistStatusMsg.style.color = "#ff5252";
			}
		});

		document.getElementById("btn-cloud-disconnect")?.addEventListener("click", () => {
			disconnectGitHub();
			refreshCloudUi();
			gistStatusMsg.textContent = "Mode Cloud désactivé. Stockage local uniquement.";
			gistStatusMsg.style.color = "#aaa";
		});
	}

	setVocabLevel(level) {
		this.selectedLevel = level;
		localStorage.setItem("dojoSelectedLevel", level);

		const rawVocab = getVocabObjectForLevel(level, this.customWords);
		this.state.completeWordList = createWordList(rawVocab);
		this.applySettingsUpdateWordList();
		this.state.currentWord = loadNewWord(this.state.currentWordList);
		this.loadMainView();
		triggerAutoSync();
	}

	getActiveVocabList() {
		return getVocabForLevel(this.selectedLevel, this.customWords);
	}

	switchMode(mode) {
		this.session.setMode(mode, 60);

		// Update UI buttons
		document.querySelectorAll(".mode-btn").forEach((btn) => {
			btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
		});

		const timerBadge = document.getElementById("timer-badge");
		const comboBadge = document.getElementById("combo-badge");
		const inputContainer = document.getElementById("input-container");
		const dokkaiContainer = document.getElementById("dokkai-options-container");

		// Reset streaks in UI
		document.getElementById("current-streak-text").textContent = "0";

		if (mode === GAME_MODES.SPRINT) {
			toggleDisplayNone(timerBadge, false);
			toggleDisplayNone(comboBadge, false);
			toggleDisplayNone(inputContainer, false);
			toggleDisplayNone(dokkaiContainer, true);
			this.session.startSprint();
			this.loadMainView();
		} else if (mode === GAME_MODES.DOKKAI) {
			toggleDisplayNone(timerBadge, true);
			toggleDisplayNone(comboBadge, false);
			toggleDisplayNone(inputContainer, true);
			toggleDisplayNone(dokkaiContainer, false);
			this.loadDokkaiQuestion();
		} else if (mode === GAME_MODES.SURVIVAL) {
			toggleDisplayNone(timerBadge, true);
			toggleDisplayNone(comboBadge, false);
			toggleDisplayNone(inputContainer, false);
			toggleDisplayNone(dokkaiContainer, true);
			this.loadMainView();
		} else {
			// Classic mode
			toggleDisplayNone(timerBadge, true);
			toggleDisplayNone(comboBadge, true);
			toggleDisplayNone(inputContainer, false);
			toggleDisplayNone(dokkaiContainer, true);
			this.loadMainView();
		}
	}

	loadMainView() {
		if (this.session.mode === GAME_MODES.DOKKAI) {
			this.loadDokkaiQuestion();
			return;
		}

		this.state.activeScreen = SCREENS.question;
		document.getElementById("main-view").classList.add("question-screen");
		document.getElementById("main-view").classList.remove("results-screen");

		document.getElementById("input-tooltip").classList.remove("tooltip-fade-animation");
		toggleDisplayNone(document.getElementById("press-any-key-text"), true);
		toggleDisplayNone(document.getElementById("status-box"), true);

		if (this.state.currentStreak0OnReset) {
			document.getElementById("current-streak-text").textContent = "0";
			this.state.currentStreak0OnReset = false;
		}

		if (this.state.loadWordOnReset) {
			this.state.currentWord = loadNewWord(this.state.currentWordList);
			this.state.loadWordOnReset = false;
		}

		showFurigana(
			this.state.settings.furigana,
			this.state.settings.furiganaTiming === CONDITIONAL_UI_TIMINGS.onlyAfterAnswering
		);
		showTranslation(
			this.state.settings.translation,
			this.state.settings.translationTiming === CONDITIONAL_UI_TIMINGS.onlyAfterAnswering
		);

		const mainInput = document.getElementById("main-text-input");
		mainInput.disabled = false;
		mainInput.value = "";
		if (!isTouch) {
			mainInput.focus();
		}

		this.session.markQuestionStart();
	}

	loadDokkaiQuestion() {
		this.state.activeScreen = SCREENS.question;
		toggleDisplayNone(document.getElementById("status-box"), true);
		toggleDisplayNone(document.getElementById("press-any-key-text"), true);

		const activeVocab = this.getActiveVocabList();
		const challenge = generateDokkaiChallenge(activeVocab);

		if (!challenge) {
			// Fallback to classic word list if challenge generation fails
			this.loadMainView();
			return;
		}

		this.currentDokkaiChallenge = challenge;

		// Set word box display
		toggleBackgroundNone(document.getElementById("verb-box"), true);
		changeVerbBoxFontColor("rgb(232, 232, 232)");

		document.getElementById("verb-text").textContent = challenge.prompt;
		document.getElementById("translation").textContent = challenge.engMeaning;
		document.getElementById("verb-type").textContent = `Base : ${challenge.dictForm}`;
		document.getElementById("conjugation-inquery-text").innerHTML =
			'<div class="conjugation-inquery"><span class="inquery-tag form-tag">Reconnaissance Dokkai (Touches 1 - 4)</span></div>';

		// Render choice buttons
		const dokkaiBtns = document.querySelectorAll(".dokkai-btn");
		dokkaiBtns.forEach((btn, idx) => {
			btn.classList.remove("correct-choice", "wrong-choice");
			btn.disabled = false;
			const labelSpan = btn.querySelector(".dokkai-label");
			if (labelSpan && challenge.options[idx]) {
				labelSpan.textContent = challenge.options[idx];
			}
		});

		this.session.markQuestionStart();
	}

	handleDokkaiChoice(chosenIndex) {
		if (!this.currentDokkaiChallenge) return;

		const challenge = this.currentDokkaiChallenge;
		const isCorrect = chosenIndex === challenge.correctIndex;
		const dokkaiBtns = document.querySelectorAll(".dokkai-btn");

		// Disable all buttons to prevent double-click
		dokkaiBtns.forEach((btn) => (btn.disabled = true));

		// Visual highlight
		dokkaiBtns[chosenIndex].classList.add(isCorrect ? "correct-choice" : "wrong-choice");
		if (!isCorrect) {
			dokkaiBtns[challenge.correctIndex].classList.add("correct-choice");
		}

		const result = this.session.recordAnswer(isCorrect, {
			question: challenge.prompt,
			expected: challenge.correctLabel,
			meaning: challenge.engMeaning,
			dictForm: challenge.dictForm,
		});

		// Sound & Streak update
		if (isCorrect) {
			sfx.playSuccess(result.reactionMs < 1200);
			if (result.stats.streak % 5 === 0) sfx.playComboMilestone();
			document.getElementById("current-streak-text").textContent = result.stats.streak;
			document.getElementById("combo-text").textContent = result.stats.streak;
			if (this.state && this.state.maxScoreObjects) {
				addToScore(1, this.state.maxScoreObjects, this.state.maxScoreIndex);
			}
			triggerAutoSync();
		} else {
			sfx.playError();
			document.getElementById("current-streak-text").textContent = "0";
			document.getElementById("combo-text").textContent = "0";
		}

		// Delay before loading next question
		const delay = isCorrect ? 380 : 850;
		setTimeout(() => {
			if (this.session.mode === GAME_MODES.DOKKAI) {
				this.loadDokkaiQuestion();
			}
		}, delay);
	}

	showSessionModal(summary) {
		const modal = document.getElementById("session-modal");
		if (!modal) return;

		document.getElementById("stat-score").textContent = `${summary.correct} / ${summary.total} (${summary.accuracy}%)`;
		document.getElementById("stat-speed").textContent = `${(summary.avgSpeedMs / 1000).toFixed(1)}s`;
		document.getElementById("stat-streak").textContent = `${summary.maxStreak}`;

		const mistakesSection = document.getElementById("mistakes-section");
		const mistakesList = document.getElementById("mistakes-list");

		if (summary.mistakes && summary.mistakes.length > 0) {
			toggleDisplayNone(mistakesSection, false);
			document.getElementById("mistakes-count").textContent = summary.mistakes.length;

			mistakesList.innerHTML = summary.mistakes
				.map(
					(m) =>
						`<div class="mistake-entry"><strong>${m.question}</strong> &rarr; <em>${m.expected}</em> <span style="color:#aaa">(${m.meaning || m.dictForm})</span></div>`
				)
				.join("");
		} else {
			toggleDisplayNone(mistakesSection, true);
		}

		toggleDisplayNone(modal, false);
	}

	closeSessionModal() {
		const modal = document.getElementById("session-modal");
		if (modal) toggleDisplayNone(modal, true);
		this.loadMainView();
	}

	onKeyDown(e) {
		const keyCode = e.keyCode ? e.keyCode : e.which;

		// Number keys 1-4 for Dokkai Flash mode
		if (this.session.mode === GAME_MODES.DOKKAI && this.state.activeScreen === SCREENS.question) {
			if (keyCode >= 49 && keyCode <= 52) { // 1, 2, 3, 4
				e.preventDefault();
				this.handleDokkaiChoice(keyCode - 49);
				return;
			}
			if (keyCode >= 97 && keyCode <= 100) { // Numpad 1, 2, 3, 4
				e.preventDefault();
				this.handleDokkaiChoice(keyCode - 97);
				return;
			}
		}

		// Escape to close session modal
		if (keyCode === 27) {
			const modal = document.getElementById("session-modal");
			if (modal && !modal.classList.contains("display-none")) {
				this.closeSessionModal();
				return;
			}
		}

		// Enter on results screen to continue
		if (
			this.state.activeScreen === SCREENS.results &&
			keyCode === 13 &&
			document.activeElement.id !== "options-button"
		) {
			this.loadMainView();
		}
	}

	onTouchEnd(e) {
		if (
			this.state.activeScreen === SCREENS.results &&
			e.target !== document.getElementById("options-button")
		) {
			this.loadMainView();
		}
	}

	inputKeyPress(e) {
		const keyCode = e.keyCode ? e.keyCode : e.which;
		if (keyCode === 13) {
			e.stopPropagation();

			const mainInput = document.getElementById("main-text-input");
			let inputValue = mainInput.value;

			const finalChar = inputValue[inputValue.length - 1];
			switch (finalChar) {
				case "n": inputValue = inputValue.replace(/n$/, "ん"); break;
				case "。": inputValue = inputValue.replace(/。$/, ""); break;
			}

			if (!isJapanese(inputValue)) {
				document.getElementById("input-tooltip").classList.add("tooltip-fade-animation");
				return;
			} else {
				document.getElementById("input-tooltip").classList.remove("tooltip-fade-animation");
			}

			this.state.activeScreen = SCREENS.results;
			document.getElementById("main-view").classList.remove("question-screen");
			document.getElementById("main-view").classList.add("results-screen");

			mainInput.blur();
			updateStatusBoxes(this.state.currentWord, inputValue);
			showFurigana(this.state.settings.furigana, false);
			showTranslation(this.state.settings.translation, false);

			const inputWasCorrect = this.state.currentWord.conjugation.validAnswers.some(
				(ans) => ans === inputValue
			);

			// Record in Session Manager
			const promptQuestion = `${toKanjiPlusHiragana(this.state.currentWord.wordJSON.kanji)} - ${this.state.currentWord.conjugation.type}`;
			const result = this.session.recordAnswer(inputWasCorrect, {
				question: promptQuestion,
				expected: this.state.currentWord.conjugation.validAnswers[0],
				userGiven: inputValue,
				meaning: this.state.currentWord.wordJSON.eng,
				dictForm: toKanjiPlusHiragana(this.state.currentWord.wordJSON.kanji),
			});

			if (inputWasCorrect) {
				sfx.playSuccess(result.reactionMs < 1200);
				if (result.stats.streak % 5 === 0) sfx.playComboMilestone();
			} else {
				sfx.playError();
			}

			// Update combo badge
			const comboText = document.getElementById("combo-text");
			if (comboText) comboText.textContent = result.stats.streak;

			updateProbabilites(
				this.state.currentWordList,
				this.state.wordsRecentlySeenQueue,
				this.state.currentWord,
				inputWasCorrect
			);

			if (inputWasCorrect) {
				addToScore(1, this.state.maxScoreObjects, this.state.maxScoreIndex);
				this.state.currentStreak0OnReset = false;
				triggerAutoSync();
			} else {
				this.state.currentStreak0OnReset = true;
			}
			this.state.loadWordOnReset = true;

			mainInput.disabled = true;
			toggleDisplayNone(document.getElementById("press-any-key-text"), false);
			mainInput.value = "";
		}
	}

	settingsButtonClicked(e) {
		this.state.activeScreen = SCREENS.settings;
		selectCheckboxesInUi(this.state.settings);
		showHideOptionsAndCheckErrors();

		toggleDisplayNone(document.getElementById("main-view"), true);
		toggleDisplayNone(document.getElementById("options-view"), false);
		toggleDisplayNone(document.getElementById("donation-section"), false);
	}

	backButtonClicked(e) {
		e.preventDefault();

		insertSettingsFromUi(this.state.settings);
		localStorage.setItem("settings", JSON.stringify(this.state.settings));

		const newMaxScoreIndex = calculateMaxScoreIndex(this.state.settings);

		if (this.state.maxScoreObjects[newMaxScoreIndex] == null) {
			this.state.maxScoreObjects[newMaxScoreIndex] = new MaxScoreObject(0);
			localStorage.setItem("maxScoreObjectsV2", JSON.stringify(this.state.maxScoreObjects));
		}

		if (newMaxScoreIndex !== this.state.maxScoreIndex) {
			this.state.maxScoreIndex = newMaxScoreIndex;
			this.state.currentStreak0OnReset = true;
			this.state.loadWordOnReset = true;
			this.applySettingsUpdateWordList();
		} else {
			applyNonConjugationSettings(this.state.settings);
		}

		document.getElementById("max-streak-text").textContent =
			this.state.maxScoreObjects[this.state.maxScoreIndex]?.score || 0;

		toggleDisplayNone(document.getElementById("main-view"), false);
		toggleDisplayNone(document.getElementById("options-view"), true);
		toggleDisplayNone(document.getElementById("donation-section"), true);

		this.loadMainView();
		triggerAutoSync();
	}

	initState(words) {
		this.state = {};
		const rawVocab = getVocabObjectForLevel(this.selectedLevel, this.customWords);
		this.state.completeWordList = createWordList(rawVocab);

		if (
			!localStorage.getItem("settings") ||
			(!localStorage.getItem("maxScoreObjects") && !localStorage.getItem("maxScoreObjectsV2"))
		) {
			this.state.settings = getDefaultSettings();
			localStorage.setItem("settings", JSON.stringify(this.state.settings));

			this.state.maxScoreIndex = calculateMaxScoreIndex(this.state.settings);
			this.state.maxScoreObjects = {};
			this.state.maxScoreObjects[this.state.maxScoreIndex] = new MaxScoreObject(0);
			localStorage.setItem("maxScoreObjectsV2", JSON.stringify(this.state.maxScoreObjects));
		} else {
			this.state.settings = Object.assign(
				getDefaultAdditiveSettings(),
				JSON.parse(localStorage.getItem("settings"))
			);
			this.state.maxScoreIndex = calculateMaxScoreIndex(this.state.settings);

			const scoresV1 = localStorage.getItem("maxScoreObjects");
			if (scoresV1 != null) {
				const scoresV2 = convertMaxScoreObjectsToV2(JSON.parse(scoresV1));
				if (scoresV2[this.state.maxScoreIndex] == null) {
					scoresV2[this.state.maxScoreIndex] = new MaxScoreObject(0);
				}
				this.state.maxScoreObjects = scoresV2;
				localStorage.setItem("maxScoreObjectsV2", JSON.stringify(this.state.maxScoreObjects));
				localStorage.removeItem("maxScoreObjects");
				localStorage.removeItem("maxScoreIndex");
			} else {
				this.state.maxScoreObjects = JSON.parse(localStorage.getItem("maxScoreObjectsV2"));
			}
		}

		this.applySettingsUpdateWordList();
		this.state.currentWord = loadNewWord(this.state.currentWordList);
		this.state.wordsRecentlySeenQueue = [];

		this.state.currentStreak0OnReset = false;
		this.state.loadWordOnReset = false;

		document.getElementById("max-streak-text").textContent =
			this.state.maxScoreObjects[this.state.maxScoreIndex]?.score || 0;

		this.loadMainView();
	}

	applySettingsUpdateWordList() {
		const filteredWords = applyAllSettingsFilterWords(
			this.state.settings,
			this.state.completeWordList
		);
		equalizeProbabilities(filteredWords);
		this.state.currentWordList = filteredWords;
	}
}

function initApp() {
	new ConjugationApp(wordData);
}

initApp();

toggleDisplayNone(document.getElementById("toppest-container"), false);
if (!isTouch) {
	document.getElementById("main-text-input").focus();
}
