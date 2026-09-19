// Cloud-First Auto-Sync via GitHub Gist & Instant URL/QR Code Transfer

const GIST_FILENAME = "dojo-progress.json";

function safeJsonParse(str, fallback) {
	try {
		return str ? JSON.parse(str) : fallback;
	} catch (e) {
		return fallback;
	}
}

export function getLocalProgressPayload() {
	return {
		version: 2,
		timestamp: Date.now(),
		settings: safeJsonParse(localStorage.getItem("settings"), {}),
		maxScoreObjectsV2: safeJsonParse(localStorage.getItem("maxScoreObjectsV2"), {}),
		dojoCustomVocab: safeJsonParse(localStorage.getItem("dojoCustomVocab"), []),
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

function utf8ToBase64(str) {
	if (typeof TextEncoder !== "undefined") {
		const bytes = new TextEncoder().encode(str);
		let binary = "";
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}
	return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(b64) {
	const binary = atob(b64);
	if (typeof TextDecoder !== "undefined") {
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return new TextDecoder().decode(bytes);
	}
	return decodeURIComponent(escape(binary));
}

export function generateSyncUrl() {
	const payload = getLocalProgressPayload();
	const jsonStr = JSON.stringify(payload);
	const encoded = encodeURIComponent(utf8ToBase64(jsonStr));
	const baseUrl = window.location.origin + window.location.pathname;
	return `${baseUrl}#sync=${encoded}`;
}

export function checkUrlForSyncImport() {
	if (typeof window === "undefined" || !window.location.hash) return null;
	const hash = window.location.hash;
	if (!hash.startsWith("#sync=")) return null;

	try {
		const rawEncoded = hash.substring(6);
		const jsonStr = base64ToUtf8(decodeURIComponent(rawEncoded));
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
			Authorization: `Bearer ${token.trim()}`,
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
			Authorization: `Bearer ${token.trim()}`,
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

	let remotePayload;
	try {
		remotePayload = JSON.parse(file.content);
	} catch (e) {
		throw new Error("Contenu du Gist invalide (JSON malformé)");
	}
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

	// Check if user has an existing dojo gist (query up to 100 gists)
	const res = await fetch("https://api.github.com/gists?per_page=100", {
		headers: {
			Authorization: `Bearer ${cleanToken}`,
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
let syncStatusListener = null;

export function setSyncStatusListener(listener) {
	syncStatusListener = listener;
}

export function triggerAutoSync() {
	const token = typeof localStorage !== "undefined" ? localStorage.getItem("dojoGistToken") : null;
	const gistId = typeof localStorage !== "undefined" ? localStorage.getItem("dojoGistId") : null;
	if (!token || !gistId) return;

	if (autoSyncTimer) clearTimeout(autoSyncTimer);
	autoSyncTimer = setTimeout(async () => {
		try {
			await pushToGitHubGist(token, gistId);
			if (syncStatusListener) {
				syncStatusListener("success");
			} else if (typeof document !== "undefined") {
				const badge = document.getElementById("cloud-status-indicator");
				if (badge) {
					badge.textContent = "Synchro OK";
					badge.classList.add("speed-fast");
					setTimeout(() => {
						badge.textContent = "Cloud";
						badge.classList.remove("speed-fast");
					}, 2500);
				}
			}
		} catch (e) {
			console.warn("Auto-sync to Gist failed:", e);
			if (syncStatusListener) {
				syncStatusListener("error", e);
			}
		}
	}, 2500);
}
