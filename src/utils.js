export function toggleDisplayNone(element, isDisplayNone) {
	toggleClassName(element, "display-none", isDisplayNone);
}

export function toggleBackgroundNone(element, isBackgroundNone) {
	toggleClassName(element, "background-none", isBackgroundNone);
}

function toggleClassName(element, className, enabled) {
	if (enabled) {
		element.classList.add(className);
	} else {
		element.classList.remove(className);
	}
}

export function escapeHtml(str) {
	if (!str) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

export function sanitizeRubyHtml(rawHtml) {
	if (!rawHtml) return "";
	const str = String(rawHtml);
	const rubyRegex = /<ruby>([\s\S]*?)<rt>([\s\S]*?)<\/rt><\/ruby>/gi;
	let result = "";
	let lastIndex = 0;
	let match;

	while ((match = rubyRegex.exec(str)) !== null) {
		if (match.index > lastIndex) {
			result += escapeHtml(str.substring(lastIndex, match.index));
		}
		const kanjiPart = escapeHtml(match[1].replace(/<[^>]*>/g, ""));
		const rtPart = escapeHtml(match[2].replace(/<[^>]*>/g, ""));
		result += `<ruby>${kanjiPart}<span class="rt">${rtPart}</span></ruby>`;
		lastIndex = rubyRegex.lastIndex;
	}

	if (lastIndex < str.length) {
		result += escapeHtml(str.substring(lastIndex));
	}

	return result;
}
