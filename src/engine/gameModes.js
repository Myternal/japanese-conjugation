import { sfx } from "./soundEffects.js";

export const GAME_MODES = Object.freeze({
	CLASSIC: "classic",
	SPRINT: "sprint",
	DOKKAI: "dokkai",
	SURVIVAL: "survival",
});

export class SessionManager {
	constructor({ onTick, onSessionEnd, onReactionSpeed } = {}) {
		this.mode = GAME_MODES.CLASSIC;
		this.onTick = onTick || (() => {});
		this.onSessionEnd = onSessionEnd || (() => {});
		this.onReactionSpeed = onReactionSpeed || (() => {});

		this.timerInterval = null;
		this.timeRemaining = 60; // seconds for sprint
		this.sprintDuration = 60;

		this.questionStartTime = 0;
		this.stats = {
			total: 0,
			correct: 0,
			incorrect: 0,
			streak: 0,
			maxStreak: 0,
			reactionTimes: [],
			mistakes: [],
		};
	}

	setMode(mode, sprintDuration = 60) {
		this.mode = mode;
		this.sprintDuration = sprintDuration;
		this.resetSession();
	}

	resetSession() {
		this.stopTimer();
		this.timeRemaining = this.sprintDuration;
		this.stats = {
			total: 0,
			correct: 0,
			incorrect: 0,
			streak: 0,
			maxStreak: 0,
			reactionTimes: [],
			mistakes: [],
		};
	}

	_startTimerInterval() {
		this.stopTimer();
		this.targetEndTime = Date.now() + this.timeRemaining * 1000;
		this.onTick(this.timeRemaining);

		this.timerInterval = setInterval(() => {
			if (this.targetEndTime) {
				const remainingMs = this.targetEndTime - Date.now();
				this.timeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
			} else {
				this.timeRemaining--;
			}
			this.onTick(this.timeRemaining);

			if (this.timeRemaining <= 0) {
				this.stopTimer();
				sfx.playSprintEnd();
				this.endSession();
			}
		}, 500);
	}

	startSprint() {
		this.resetSession();
		this.timeRemaining = this.sprintDuration;
		this._startTimerInterval();
	}

	pauseSprint() {
		this.stopTimer();
	}

	resumeSprint() {
		if (this.mode !== GAME_MODES.SPRINT) return;
		if (this.timeRemaining <= 0) return;
		this._startTimerInterval();
	}

	stopTimer() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}

	markQuestionStart() {
		this.questionStartTime = performance.now();
	}

	recordAnswer(isCorrect, { question, expected, userGiven = "", meaning = "", dictForm = "", bunproUrl = "" } = {}) {
		const rawReactionMs = Math.round(performance.now() - this.questionStartTime);
		const reactionMs = Math.max(0, rawReactionMs);
		// Cap reaction time for statistical averaging at 15s to avoid idle skew
		const cappedReactionForStats = Math.min(reactionMs, 15000);
		this.stats.total++;
		this.stats.reactionTimes.push(cappedReactionForStats);

		// Evaluate speed category (calibrated against user's 3-second Anki rule)
		let speedTag = {
			ms: reactionMs,
			text: "Fluide",
			class: "speed-fluent",
		};
		if (reactionMs < 1200) {
			speedTag = { ms: reactionMs, text: "Éclair", class: "speed-fast" };
		} else if (reactionMs > 3000) {
			speedTag = { ms: reactionMs, text: "Hésitant", class: "speed-slow" };
		}

		this.onReactionSpeed(speedTag);

		if (isCorrect) {
			this.stats.correct++;
			this.stats.streak++;
			if (this.stats.streak > this.stats.maxStreak) {
				this.stats.maxStreak = this.stats.streak;
			}
		} else {
			this.stats.incorrect++;
			this.stats.streak = 0;
			this.stats.mistakes.push({
				question: question || "",
				expected: expected || "",
				userGiven: userGiven || "",
				meaning: meaning || "",
				dictForm: dictForm || "",
				bunproUrl: bunproUrl || "",
				reactionMs,
			});

			if (this.mode === GAME_MODES.SURVIVAL) {
				this.endSession();
			}
		}

		return { isCorrect, reactionMs, speedTag, stats: this.stats };
	}

	endSession() {
		this.stopTimer();
		const avgSpeedMs = this.stats.reactionTimes.length > 0
			? Math.round(this.stats.reactionTimes.reduce((a, b) => a + b, 0) / this.stats.reactionTimes.length)
			: 0;

		const accuracy = this.stats.total > 0
			? Math.round((this.stats.correct / this.stats.total) * 100)
			: 0;

		const summary = {
			mode: this.mode,
			total: this.stats.total,
			correct: this.stats.correct,
			incorrect: this.stats.incorrect,
			maxStreak: this.stats.maxStreak,
			accuracy,
			avgSpeedMs,
			mistakes: this.stats.mistakes,
		};

		this.onSessionEnd(summary);
		return summary;
	}

	exportMistakesTSV() {
		if (!this.stats.mistakes || this.stats.mistakes.length === 0) return "";
		// TSV format: Front (Question/Form) \t Back (Expected + Meaning)
		return this.stats.mistakes
			.map((m) => {
				const meaningSuffix = m.meaning ? ` (${m.meaning})` : "";
				return `${m.question}\t${m.expected}${meaningSuffix}`;
			})
			.join("\n");
	}
}
