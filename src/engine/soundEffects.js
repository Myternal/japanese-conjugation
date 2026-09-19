// Web Audio API lightweight sound effects (Zero external files, zero latency)

class SoundEffects {
	constructor() {
		this.ctx = null;
		this.muted = localStorage.getItem("dojoSoundMuted") === "true";
	}

	initContext() {
		if (!this.ctx && typeof window !== "undefined") {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			if (AudioContext) {
				this.ctx = new AudioContext();
			}
		}
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume();
		}
	}

	toggleMute() {
		this.muted = !this.muted;
		localStorage.setItem("dojoSoundMuted", this.muted ? "true" : "false");
		return this.muted;
	}

	isMuted() {
		return this.muted;
	}

	playTone(freq, type = "sine", duration = 0.15, gainVal = 0.1, delay = 0) {
		if (this.muted) return;
		this.initContext();
		if (!this.ctx) return;

		const startTime = this.ctx.currentTime + delay;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(freq, startTime);

		gain.gain.setValueAtTime(gainVal, startTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start(startTime);
		osc.stop(startTime + duration);
	}

	playSuccess(isFast = false) {
		if (this.muted) return;
		// Two-tone bright chime
		this.playTone(523.25, "sine", 0.12, 0.08, 0);      // C5
		this.playTone(isFast ? 880 : 659.25, "triangle", 0.18, 0.1, 0.07); // A5 or E5
	}

	playError() {
		if (this.muted) return;
		// Soft low blip
		this.playTone(220, "sawtooth", 0.18, 0.06, 0);     // A3
		this.playTone(185, "sine", 0.22, 0.08, 0.06);     // F#3
	}

	playComboMilestone() {
		if (this.muted) return;
		// Upbeat celebratory arpeggio
		const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
		notes.forEach((freq, idx) => {
			this.playTone(freq, "sine", 0.15, 0.09, idx * 0.06);
		});
	}

	playTick() {
		if (this.muted) return;
		this.playTone(1200, "square", 0.03, 0.02, 0);
	}

	playSprintEnd() {
		if (this.muted) return;
		const notes = [783.99, 659.25, 523.25];
		notes.forEach((freq, idx) => {
			this.playTone(freq, "triangle", 0.25, 0.09, idx * 0.1);
		});
	}
}

export const sfx = new SoundEffects();
