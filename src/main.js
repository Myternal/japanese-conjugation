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
import { CONJUGATION_TYPES, PARTS_OF_SPEECH, MaxScoreObject } from "./constants.js";
import {
	createWordList,
	pickRandomWord,
	equalizeProbabilities,
	updateProbabilities,
} from "./engine/wordSelector.js";
import { toggleDisplayNone, toggleBackgroundNone, escapeHtml, sanitizeRubyHtml } from "./utils.js";
import { toKanjiPlusHiragana, toHiragana, dropFinalLetter } from "./engine/conjugator.js";
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
	autoConnectGitHub,
	disconnectGitHub,
	isCloudConnected,
	silentPullOnStartup,
	triggerAutoSync,
} from "./engine/syncManager.js";
import {
	getConjugationDescription,
	getConjugationFormLabel,
} from "./engine/conjugationDescriptions.js";

const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
document.getElementById("press-any-key-text").textContent = isTouch
	? "Touche l'écran pour continuer"
	: "Appuie sur Entrée pour continuer";

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

function conjugationInqueryFormatting(conjugation, showHint = true, showPatterns = true) {
	const tags = [];
	const desc = getConjugationDescription(conjugation);

	// Main conjugation type tag
	const formLabel = getConjugationFormLabel(conjugation.type, showPatterns);

	if (formLabel) {
		const tooltipAttr = desc && desc.tooltip ? ` title="${escapeHtml(desc.tooltip)}"` : "";
		tags.push(`<span class="inquery-tag form-tag"${tooltipAttr}>${formLabel}</span>`);
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

	let html = `<div class="conjugation-inquery">${tags.join("")}</div>`;
	if (showHint && desc && desc.shortText) {
		html += `<div class="form-description-hint"><span class="form-desc-icon">💡</span>${escapeHtml(desc.shortText)}</div>`;
	}

	return html;
}

function changeVerbBoxFontColor(color) {
	const ps = document.getElementById("verb-box").getElementsByTagName("p");
	for (const p of Array.from(ps)) {
		p.style.color = color;
	}
}

function setVerbTypeText(text = "") {
	const el = document.getElementById("verb-type");
	if (!el) return;
	if (!text || text.trim() === "" || text === "\u00A0") {
		el.textContent = "\u00A0";
		el.classList.remove("visible-badge");
	} else {
		el.textContent = text;
		el.classList.add("visible-badge");
	}
}

function updateCurrentWord(word, settings = null) {
	toggleBackgroundNone(document.getElementById("verb-box"), true);
	if (!word || !word.wordJSON) {
		document.getElementById("verb-text").innerHTML = "Aucun mot";
		document.getElementById("translation").textContent = "Active plus d'options dans les paramètres.";
		setVerbTypeText("");
		document.getElementById("conjugation-inquery-text").innerHTML = "";
		const mainInput = document.getElementById("main-text-input");
		if (mainInput) mainInput.disabled = true;
		return;
	}

	const showHint = !settings || settings.formHelp !== false;
	const showPatterns = !settings || settings.formPatterns !== false;
	document.getElementById("verb-text").innerHTML = sanitizeRubyHtml(word.wordJSON.kanji);
	document.getElementById("translation").textContent = word.wordJSON.eng;
	setVerbTypeText("");
	document.getElementById("conjugation-inquery-text").innerHTML =
		conjugationInqueryFormatting(word.conjugation, showHint, showPatterns);
}

function loadNewWord(wordList, settings = null) {
	if (!wordList || wordList.length === 0) {
		updateCurrentWord(null, settings);
		changeVerbBoxFontColor("rgb(232, 232, 232)");
		return null;
	}
	const word = pickRandomWord(wordList);
	updateCurrentWord(word, settings);
	changeVerbBoxFontColor("rgb(232, 232, 232)");
	return word;
}

function addToScore(amount = 1, maxScoreObjects, maxScoreIndex) {
	if (amount === 0) return;
	const max = document.getElementById("max-streak-text");
	const current = document.getElementById("current-streak-text");

	const currentVal = parseInt(current?.textContent?.trim() || "0", 10) || 0;
	const maxVal = parseInt(max?.textContent?.trim() || "0", 10) || 0;

	if (maxVal <= currentVal) {
		const newAmount = currentVal + amount;
		max.textContent = newAmount;
		if (!document.getElementById("max-streak").classList.contains("display-none")) {
			max.classList.remove("grow-animation");
			void max.offsetWidth;
			max.classList.add("grow-animation");
		}

		if (maxScoreObjects && maxScoreObjects[maxScoreIndex]) {
			maxScoreObjects[maxScoreIndex].score = newAmount;
			localStorage.setItem("maxScoreObjectsV2", JSON.stringify(maxScoreObjects));
		}
	}

	current.textContent = currentVal + amount;
	if (!document.getElementById("current-streak").classList.contains("display-none")) {
		current.classList.remove("grow-animation");
		void current.offsetWidth;
		current.classList.add("grow-animation");
	}
}

function typeToWordBoxColor(type) {
	switch (type) {
		case "u": return "rgba(194, 94, 64, 0.4)"; // warm terracotta
		case "ru": return "rgba(59, 89, 152, 0.45)"; // refined indigo
		case "irv":
		case "ira": return "rgba(80, 90, 105, 0.45)"; // slate
		case "i": return "rgba(37, 106, 115, 0.45)"; // subtle teal
		case "na": return "rgba(120, 85, 55, 0.45)"; // warm cedar
		default: return "rgba(63, 70, 84, 0.45)";
	}
}

function updateStatusBoxes(word, entryText) {
	const statusBox = document.getElementById("status-box");
	toggleDisplayNone(statusBox, false);
	statusBox.classList.remove("status-correct", "status-incorrect");
	statusBox.style.background = "";

	if (word.conjugation.validAnswers.some((e) => e === entryText)) {
		statusBox.classList.add("status-correct");
		const subConjugationForm = getSubConjugationForm(word, entryText);
		document.getElementById("status-text").innerHTML = `<span class="status-badge-correct">✓ Correct</span>${
			subConjugationForm != null
				? '<span class="sub-conjugation-indicator">(' + escapeHtml(subConjugationForm) + ")</span>"
				: ""
		}<div class="status-answer-line">${escapeHtml(entryText)} <span class="status-mark-correct">○</span></div>`;
	} else {
		statusBox.classList.add("status-incorrect");
		document.getElementById("verb-box").style.background = typeToWordBoxColor(word.wordJSON.type);
		toggleBackgroundNone(document.getElementById("verb-box"), false);
		changeVerbBoxFontColor("white");
		setVerbTypeText(wordTypeToDisplayText(word.wordJSON.type));

		document.getElementById("status-text").innerHTML =
			`<div class="status-user-answer">${entryText === "" ? "—" : escapeHtml(entryText)} <span class="status-mark-wrong">×</span></div>` +
			`<div class="status-expected-answer">${escapeHtml(word.conjugation.validAnswers[0])} <span class="status-mark-correct">○</span></div>`;
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

// Main ConjugationApp Controller
class ConjugationApp {
	constructor() {
		const mainInput = document.getElementById("main-text-input");
		bind(mainInput);

		this.isDokkaiProcessing = false;

		// Initialize Custom Vocab & Level
		this.customWords = [];
		this.selectedLevel = "all";
		this.refreshStateFromStorage();

		// Check for instant URL sync import
		const importedSync = checkUrlForSyncImport();
		if (importedSync) {
			this.refreshStateFromStorage();
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

		this.initState();
		this.setupEventListeners();
		this.setupDojoControls();

		// Option A: 100% Cloud-First silent pull on startup
		silentPullOnStartup()
			.then((remotePayload) => {
				if (remotePayload) {
					this.refreshStateFromStorage();
					// Only re-init state if user is still on initial idle screen
					if (this.session && this.session.mode === GAME_MODES.CLASSIC && this.session.stats.total === 0) {
						this.initState();
					}
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
				console.warn("Silent startup pull failed:", err);
			});

		// Deep-linking: detect mode & level from URL query parameters or hash
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			let urlMode = urlParams.get("mode");
			if (!urlMode && window.location.hash.startsWith("#mode=")) {
				urlMode = window.location.hash.slice(6);
			}
			const urlLevel = urlParams.get("level");

			if (urlLevel && ["n5", "n4", "n3", "n2", "all"].includes(urlLevel.toLowerCase())) {
				this.setVocabLevel(urlLevel.toLowerCase(), false);
			}

			if (urlMode && Object.values(GAME_MODES).includes(urlMode.toLowerCase())) {
				this.switchMode(urlMode.toLowerCase(), false);
			}

			window.addEventListener("popstate", () => {
				const params = new URLSearchParams(window.location.search);
				const popMode = params.get("mode") || GAME_MODES.CLASSIC;
				if (Object.values(GAME_MODES).includes(popMode)) {
					this.switchMode(popMode, false);
				}
				const popLevel = params.get("level");
				if (popLevel && ["n5", "n4", "n3", "n2", "all"].includes(popLevel.toLowerCase())) {
					this.setVocabLevel(popLevel.toLowerCase(), false);
				}
			});
		}

		optionsMenuInit();
	}

	setupEventListeners() {
		const mainInput = document.getElementById("main-text-input");
		mainInput.addEventListener("keydown", (e) => this.inputKeyPress(e));
		document.getElementById("options-button").addEventListener("click", (e) => this.settingsButtonClicked(e));
		document.getElementById("options-form").addEventListener("submit", (e) => this.backButtonClicked(e));

		document.addEventListener("keydown", this.onKeyDown.bind(this));
		document.addEventListener("touchend", this.onTouchEnd.bind(this));
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") {
				triggerAutoSync();
			}
		});
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

		// Manual End Session / Recap button
		document.getElementById("end-session-btn")?.addEventListener("click", () => {
			this.session.endSession();
		});

		// Modal buttons
		document.getElementById("modal-restart-btn").addEventListener("click", () => {
			const targetMode = this.session.mode;
			this.closeSessionModal(false);
			this.switchMode(targetMode);
		});
		document.getElementById("modal-close-btn").addEventListener("click", () => {
			this.closeSessionModal(true);
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
					const customPresetBtn = document.getElementById("preset-btn-custom");
					if (customPresetBtn) {
						toggleDisplayNone(customPresetBtn, false);
					}
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
			qrImg.onerror = () => {
				qrImg.style.display = "none";
				alert("Le volume de données est trop important pour générer un QR code direct. Utilise le bouton 'Copier le lien' ou la synchronisation GitHub Gist.");
			};
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
				this.refreshStateFromStorage();
				refreshCloudUi();
				gistStatusMsg.textContent = res.isNew
					? "Nouveau Gist créé et synchronisé avec succès."
					: "Gist synchronisé avec succès.";
				gistStatusMsg.style.color = "#00e676";
				this.initState();
				triggerAutoSync();
			} catch (err) {
				gistStatusMsg.textContent = `Erreur : ${err.message}`;
				gistStatusMsg.style.color = "#ff5252";
			}
		});

		if (gistTokenInput) {
			gistTokenInput.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					document.getElementById("btn-cloud-connect")?.click();
				}
			});
		}

		document.getElementById("btn-cloud-disconnect")?.addEventListener("click", () => {
			disconnectGitHub();
			refreshCloudUi();
			gistStatusMsg.textContent = "Mode Cloud désactivé. Stockage local uniquement.";
			gistStatusMsg.style.color = "#aaa";
		});
	}

	refreshStateFromStorage() {
		this.selectedLevel = localStorage.getItem("dojoSelectedLevel") || "all";
		const storedCustom = localStorage.getItem("dojoCustomVocab");
		if (storedCustom) {
			try {
				this.customWords = JSON.parse(storedCustom);
			} catch (e) {
				this.customWords = [];
			}
		} else {
			this.customWords = [];
		}

		const customPresetBtn = document.getElementById("preset-btn-custom");
		if (customPresetBtn) {
			toggleDisplayNone(customPresetBtn, this.customWords.length === 0);
		}

		document.querySelectorAll(".preset-btn").forEach((btn) => {
			btn.classList.toggle("active", btn.getAttribute("data-level") === this.selectedLevel);
		});
	}

	setVocabLevel(level, updateUrl = true) {
		this.selectedLevel = level;
		localStorage.setItem("dojoSelectedLevel", level);

		if (updateUrl && typeof window !== "undefined" && window.history) {
			try {
				const url = new URL(window.location.href);
				if (level === "all") {
					url.searchParams.delete("level");
				} else {
					url.searchParams.set("level", level);
				}
				window.history.replaceState(null, document.title, url.toString());
			} catch (e) {}
		}

		// Update preset button active states in UI
		document.querySelectorAll(".preset-btn").forEach((btn) => {
			btn.classList.toggle("active", btn.getAttribute("data-level") === level);
		});

		if (!this.state) return;

		this.state.wordsRecentlySeenQueue = [];
		const rawVocab = getVocabObjectForLevel(level, this.customWords);
		this.state.completeWordList = createWordList(rawVocab);
		this.applySettingsUpdateWordList();
		this.state.currentWord = loadNewWord(this.state.currentWordList, this.state.settings);
		if (this.state.activeScreen !== SCREENS.settings) {
			this.loadMainView();
		}
		triggerAutoSync();
	}

	getActiveVocabList() {
		return getVocabForLevel(this.selectedLevel, this.customWords);
	}

	switchMode(mode, updateUrl = true) {
		this.session.setMode(mode, 60);

		if (updateUrl && typeof window !== "undefined" && window.history) {
			try {
				const url = new URL(window.location.href);
				if (mode === GAME_MODES.CLASSIC) {
					url.searchParams.delete("mode");
				} else {
					url.searchParams.set("mode", mode);
				}
				window.history.replaceState(null, document.title, url.toString());
			} catch (e) {}
		}

		// Update UI buttons
		document.querySelectorAll(".mode-btn").forEach((btn) => {
			btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
		});

		const timerBadge = document.getElementById("timer-badge");
		const comboBadge = document.getElementById("combo-badge");
		const inputContainer = document.getElementById("input-container");
		const dokkaiContainer = document.getElementById("dokkai-options-container");

		// If currently on options screen, close options and restore main game view
		const optionsView = document.getElementById("options-view");
		if (optionsView && !optionsView.classList.contains("display-none")) {
			insertSettingsFromUi(this.state.settings);
			localStorage.setItem("settings", JSON.stringify(this.state.settings));
			this.state.maxScoreIndex = calculateMaxScoreIndex(this.state.settings);
			this.applySettingsUpdateWordList();
			toggleDisplayNone(optionsView, true);
			toggleDisplayNone(document.getElementById("donation-section"), true);
			toggleDisplayNone(document.getElementById("main-view"), false);
		}

		// Reset streaks & combo in UI
		document.getElementById("current-streak-text").textContent = "0";
		const comboText = document.getElementById("combo-text");
		if (comboText) comboText.textContent = "0";

		// Force loading a fresh word when switching modes
		this.state.loadWordOnReset = true;

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

		if (this.state.loadWordOnReset || !this.state.currentWord) {
			this.state.currentWord = loadNewWord(this.state.currentWordList, this.state.settings);
			this.state.loadWordOnReset = false;
		} else {
			updateCurrentWord(this.state.currentWord, this.state.settings);
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
		this.isDokkaiProcessing = false;
		this.state.activeScreen = SCREENS.question;
		document.getElementById("main-view").classList.add("question-screen");
		document.getElementById("main-view").classList.remove("results-screen");
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

		// Ensure translation is visible in Dokkai Flash mode
		showTranslation(true, false);

		document.getElementById("verb-text").textContent = challenge.prompt;
		document.getElementById("translation").textContent = challenge.engMeaning;
		setVerbTypeText(`Base : ${challenge.dictForm}`);
		document.getElementById("conjugation-inquery-text").innerHTML =
			'<div class="conjugation-inquery"><span class="inquery-tag form-tag">Reconnaissance Dokkai (Touches 1 - 4)</span></div>';

		// Render choice buttons
		const dokkaiBtns = document.querySelectorAll(".dokkai-btn");
		dokkaiBtns.forEach((btn, idx) => {
			btn.classList.remove("correct-choice", "wrong-choice");
			const labelSpan = btn.querySelector(".dokkai-label");
			if (challenge.options[idx]) {
				btn.style.display = "";
				btn.disabled = false;
				if (labelSpan) {
					labelSpan.textContent = challenge.options[idx];
				}
			} else {
				btn.style.display = "none";
				btn.disabled = true;
			}
		});

		this.session.markQuestionStart();
	}

	handleDokkaiChoice(chosenIndex) {
		const modal = document.getElementById("session-modal");
		if (modal && !modal.classList.contains("display-none")) return;
		if (!this.currentDokkaiChallenge || this.isDokkaiProcessing) return;
		if (!this.currentDokkaiChallenge.options || !this.currentDokkaiChallenge.options[chosenIndex]) return;
		this.isDokkaiProcessing = true;

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
			document.getElementById("combo-text").textContent = result.stats.streak;
			if (this.state && this.state.maxScoreObjects) {
				addToScore(1, this.state.maxScoreObjects, this.state.maxScoreIndex);
			}
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
			} else {
				this.isDokkaiProcessing = false;
			}
		}, delay);
	}

	showSessionModal(summary) {
		const modal = document.getElementById("session-modal");
		if (!modal) return;

		const mainInput = document.getElementById("main-text-input");
		if (mainInput) {
			mainInput.disabled = true;
			mainInput.blur();
		}

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
						`<div class="mistake-entry"><strong>${escapeHtml(m.question)}</strong> &rarr; <em>${escapeHtml(m.expected)}</em> <span style="color:#aaa">(${escapeHtml(m.meaning || m.dictForm)})</span></div>`
				)
				.join("");
		} else {
			toggleDisplayNone(mistakesSection, true);
		}

		toggleDisplayNone(modal, false);
	}

	closeSessionModal(shouldSwitchToClassic = true) {
		const modal = document.getElementById("session-modal");
		if (modal) toggleDisplayNone(modal, true);
		triggerAutoSync();
		if (shouldSwitchToClassic) {
			if (this.session && (this.session.mode === GAME_MODES.SURVIVAL || this.session.mode === GAME_MODES.SPRINT)) {
				this.switchMode(GAME_MODES.CLASSIC);
				return;
			}
		}
		this.loadMainView();
	}

	onKeyDown(e) {
		const keyCode = e.keyCode ? e.keyCode : e.which;
		const isEnter = e.key === "Enter" || keyCode === 13;
		const isEscape = e.key === "Escape" || keyCode === 27;

		// 1. Session modal key handling (takes priority over background inputs)
		const modal = document.getElementById("session-modal");
		if (modal && !modal.classList.contains("display-none")) {
			if (isEscape) {
				this.closeSessionModal(true);
			}
			return;
		}

		// 2. Number keys 1-4 for Dokkai Flash mode (standard, numpad, and AZERTY laptop row)
		if (
			this.session.mode === GAME_MODES.DOKKAI &&
			this.state.activeScreen === SCREENS.question &&
			!this.isDokkaiProcessing
		) {
			const azertyMap = { "&": 0, "é": 1, '"': 2, "'": 3 };
			if (e.key in azertyMap) {
				e.preventDefault();
				this.handleDokkaiChoice(azertyMap[e.key]);
				return;
			}
			if (e.code && /^Digit[1-4]$/.test(e.code)) {
				e.preventDefault();
				this.handleDokkaiChoice(parseInt(e.code.slice(5), 10) - 1);
				return;
			}
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

		// 3. Enter on results screen to continue
		if (
			this.state.activeScreen === SCREENS.results &&
			isEnter &&
			document.activeElement?.tagName !== "BUTTON"
		) {
			this.loadMainView();
		}
	}

	onTouchEnd(e) {
		const modal = document.getElementById("session-modal");
		if (modal && !modal.classList.contains("display-none")) return;

		if (
			this.state.activeScreen === SCREENS.results &&
			!e.target.closest("#options-button, #mode-bar, #sound-toggle-btn, #end-session-btn, #session-modal")
		) {
			this.loadMainView();
		}
	}

	inputKeyPress(e) {
		const keyCode = e.keyCode ? e.keyCode : e.which;
		const isEnter = e.key === "Enter" || keyCode === 13;
		if (isEnter) {
			if (e.isComposing || e.keyCode === 229) return;
			e.stopPropagation();

			if (!this.state.currentWord) return;

			const mainInput = document.getElementById("main-text-input");
			let inputValue = mainInput.value.trim();

			const finalChar = inputValue[inputValue.length - 1];
			switch (finalChar) {
				case "n": inputValue = inputValue.replace(/n$/, "ん"); break;
				case "。": inputValue = inputValue.replace(/。$/, ""); break;
			}

			if (inputValue !== "" && !isJapanese(inputValue)) {
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

			updateProbabilities(
				this.state.currentWordList,
				this.state.wordsRecentlySeenQueue,
				this.state.currentWord,
				inputWasCorrect
			);

			if (inputWasCorrect) {
				addToScore(1, this.state.maxScoreObjects, this.state.maxScoreIndex);
				this.state.currentStreak0OnReset = false;
			} else {
				this.state.currentStreak0OnReset = true;
			}
			this.state.loadWordOnReset = true;

			if (this.session.mode === GAME_MODES.SURVIVAL && !inputWasCorrect) {
				mainInput.disabled = true;
				mainInput.value = "";
				return;
			}

			mainInput.disabled = true;
			toggleDisplayNone(document.getElementById("press-any-key-text"), false);
			mainInput.value = "";
		}
	}

	settingsButtonClicked(e) {
		if (this.session) {
			this.session.pauseSprint();
		}
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
			this.state.wordsRecentlySeenQueue = [];
			this.applySettingsUpdateWordList();
		} else {
			applyNonConjugationSettings(this.state.settings);
		}

		document.getElementById("max-streak-text").textContent =
			this.state.maxScoreObjects[this.state.maxScoreIndex]?.score || 0;

		toggleDisplayNone(document.getElementById("main-view"), false);
		toggleDisplayNone(document.getElementById("options-view"), true);
		toggleDisplayNone(document.getElementById("donation-section"), true);

		if (this.session && this.session.mode === GAME_MODES.SPRINT) {
			this.session.resumeSprint();
		}

		this.loadMainView();
		triggerAutoSync();
	}

	initState() {
		this.state = {
			activeScreen: SCREENS.question,
		};
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
			let savedSettings = {};
			try {
				savedSettings = JSON.parse(localStorage.getItem("settings") || "{}") || {};
			} catch (e) {}

			this.state.settings = Object.assign(
				getDefaultAdditiveSettings(),
				savedSettings
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
				let parsedScores = {};
				try {
					parsedScores = JSON.parse(localStorage.getItem("maxScoreObjectsV2") || "{}") || {};
				} catch (e) {}
				this.state.maxScoreObjects = parsedScores;
				if (!this.state.maxScoreObjects[this.state.maxScoreIndex]) {
					this.state.maxScoreObjects[this.state.maxScoreIndex] = new MaxScoreObject(0);
				}
			}
		}

		this.applySettingsUpdateWordList();
		this.state.currentWord = loadNewWord(this.state.currentWordList, this.state.settings);
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
	new ConjugationApp();
}

initApp();

toggleDisplayNone(document.getElementById("toppest-container"), false);
if (!isTouch) {
	document.getElementById("main-text-input").focus();
}
