// Cloud-First Auto-Sync via GitHub Gist & Instant URL/QR Code Transfer

const GIST_FILENAME = "dojo-progress.json";

export function getLocalProgressPayload() {
	return {
		version: 2,
		timestamp: Date.now(),
		settings: JSON.parse(localStorage.getItem("settings") || "{}"),
		maxScoreObjectsV2: JSON.parse(localStorage.getItem("maxScoreObjectsV2") || "{}"),
		dojoCustomVocab: JSON.parse(localStorage.getItem("dojoCustomVocab") || "[]"),
		dojoSelectedLevel: localStorage.getItem("dojoSelectedLevel") || "all",
		dojoSoundMuted: localStorage.getItem("dojoSoundMuted") === "true",
	};
}

export function applyProgressPayload(payload) {
	if (!payload) return false;
	try {
		if (payload.settings) {
			localStorage.setItem("settings", JSON.stringify(payload.settings));
		}
		if (payload.maxScoreObjectsV2) {
			let currentScores = {};
			try {
				currentScores = JSON.parse(localStorage.getItem("maxScoreObjectsV2") || "{}");
			} catch (e) {}

			const mergedScores = { ...currentScores };
			for (const [k, v] of Object.entries(payload.maxScoreObjectsV2)) {
				const remoteVal = v && typeof v.score === "number" ? v.score : 0;
				const localVal = mergedScores[k] && typeof mergedScores[k].score === "number" ? mergedScores[k].score : 0;
				mergedScores[k] = { score: Math.max(localVal, remoteVal) };
			}
			localStorage.setItem("maxScoreObjectsV2", JSON.stringify(mergedScores));
		}
		if (payload.dojoCustomVocab) {
			localStorage.setItem("dojoCustomVocab", JSON.stringify(payload.dojoCustomVocab));
		}
		if (payload.dojoSelectedLevel) {
			localStorage.setItem("dojoSelectedLevel", payload.dojoSelectedLevel);
		}
		if (typeof payload.dojoSoundMuted === "boolean") {
			localStorage.setItem("dojoSoundMuted", payload.dojoSoundMuted ? "true" : "false");
		}
		return true;
	} catch (e) {
		console.error("Error applying progress payload:", e);
		return false;
	}
}

export function generateSyncUrl() {
	const payload = getLocalProgressPayload();
	const jsonStr = JSON.stringify(payload);
	const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
	const baseUrl = window.location.origin + window.location.pathname;
	return `${baseUrl}#sync=${encoded}`;
}

export function checkUrlForSyncImport() {
	if (typeof window === "undefined" || !window.location.hash) return null;
	const hash = window.location.hash;
	if (!hash.startsWith("#sync=")) return null;

	try {
		const rawEncoded = hash.substring(6);
		const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(rawEncoded))));
		const payload = JSON.parse(jsonStr);

		if (payload && payload.version) {
			applyProgressPayload(payload);
			history.replaceState(null, document.title, window.location.pathname + window.location.search);
			return payload;
		}
	} catch (e) {
		console.error("Failed to parse sync payload from URL hash:", e);
	}
	return null;
}

// GitHub Gist API Core Operations
export async function pushToGitHubGist(token, gistId = null) {
	if (!token) throw new Error("Token GitHub requis");

	const payload = getLocalProgressPayload();
	const bodyData = {
		description: "Dojo Réflexe 日本語 - Sauvegarde de progression Cloud",
		public: false,
		files: {
			[GIST_FILENAME]: {
				content: JSON.stringify(payload, null, 2),
			},
		},
	};

	let url = "https://api.github.com/gists";
	let method = "POST";

	if (gistId) {
		url = `https://api.github.com/gists/${gistId}`;
		method = "PATCH";
	}

	const res = await fetch(url, {
		method,
		headers: {
			Authorization: `token ${token.trim()}`,
			Accept: "application/vnd.github.v3+json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bodyData),
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || `Erreur GitHub API (${res.status})`);
	}

	const data = await res.json();
	localStorage.setItem("dojoGistId", data.id);
	localStorage.setItem("dojoGistLastSync", Date.now().toString());
	return data;
}

export async function pullFromGitHubGist(token, gistId) {
	if (!token || !gistId) throw new Error("Token et Gist ID requis");

	const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
		method: "GET",
		headers: {
			Authorization: `token ${token.trim()}`,
			Accept: "application/vnd.github.v3+json",
		},
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || `Erreur GitHub API (${res.status})`);
	}

	const data = await res.json();
	const file = data.files?.[GIST_FILENAME];
	if (!file || !file.content) {
		throw new Error("Fichier de progression non trouvé dans ce Gist");
	}

	const remotePayload = JSON.parse(file.content);
	applyProgressPayload(remotePayload);
	localStorage.setItem("dojoGistLastSync", Date.now().toString());
	return remotePayload;
}

// Transparent Auto-Sync Management
export function isCloudConnected() {
	return Boolean(localStorage.getItem("dojoGistToken") && localStorage.getItem("dojoGistId"));
}

export function disconnectGitHub() {
	localStorage.removeItem("dojoGistToken");
	localStorage.removeItem("dojoGistId");
	localStorage.removeItem("dojoGistLastSync");
}

/**
 * Connect to GitHub with token:
 * Automatically searches for existing dojo-progress Gist or creates one.
 */
export async function autoConnectGitHub(token) {
	if (!token || !token.trim()) throw new Error("Token GitHub requis");
	const cleanToken = token.trim();

	// Check if user has an existing dojo gist
	const res = await fetch("https://api.github.com/gists", {
		headers: {
			Authorization: `token ${cleanToken}`,
			Accept: "application/vnd.github.v3+json",
		},
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(err.message || `Authentification impossible (${res.status})`);
	}

	const gists = await res.json();
	const existingGist = gists.find((g) => g.files && g.files[GIST_FILENAME]);

	localStorage.setItem("dojoGistToken", cleanToken);

	if (existingGist) {
		localStorage.setItem("dojoGistId", existingGist.id);
		// Pull latest remote data to sync locally
		const remotePayload = await pullFromGitHubGist(cleanToken, existingGist.id);
		return { isNew: false, gistId: existingGist.id, payload: remotePayload };
	} else {
		// Create new cloud backup with current progress
		const newGist = await pushToGitHubGist(cleanToken, null);
		return { isNew: true, gistId: newGist.id, payload: getLocalProgressPayload() };
	}
}

/**
 * Startup silent sync: Pulls latest Gist data if connected
 */
export async function silentPullOnStartup() {
	const token = localStorage.getItem("dojoGistToken");
	const gistId = localStorage.getItem("dojoGistId");
	if (!token || !gistId) return null;

	try {
		const remotePayload = await pullFromGitHubGist(token, gistId);
		return remotePayload;
	} catch (e) {
		console.warn("Silent startup pull failed:", e);
		return null;
	}
}

// Debounced auto-save to cloud
let autoSyncTimer = null;
export function triggerAutoSync() {
	const token = localStorage.getItem("dojoGistToken");
	const gistId = localStorage.getItem("dojoGistId");
	if (!token || !gistId) return;

	if (autoSyncTimer) clearTimeout(autoSyncTimer);
	autoSyncTimer = setTimeout(async () => {
		try {
			await pushToGitHubGist(token, gistId);
			const badge = document.getElementById("cloud-status-indicator");
			if (badge) {
				badge.textContent = "Synchro OK";
				badge.classList.add("speed-fast");
				setTimeout(() => {
					badge.textContent = "Cloud";
					badge.classList.remove("speed-fast");
				}, 2500);
			}
		} catch (e) {
			console.warn("Auto-sync to Gist failed:", e);
		}
	}, 600);
}
