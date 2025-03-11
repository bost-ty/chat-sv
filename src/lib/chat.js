/**
 *
 * @param {string} ircMessage
 * @returns {{timestamp: Date, username: string, message: string}}
 */
export function parseIrc(ircMessage) {
	const timestamp = new Date();
	const username = ircMessage.split("!")[0].slice(1)?.trim();
	const message = ircMessage.split(":").slice(2).join(":")?.trim();
	return { timestamp, username, message };
}

/**
 * Turn any given string into the same number every time.
 * @param {string} string
 * @returns {number}
 */
function hashStringToNumber(string) {
	return [...string].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

/**
 * Create a more divergent number via hashing a string.
 * @param {string} string
 * @returns {number}
 */
function divergentStringToNumber(string) {
	let hash = 0;
	for (let i = 0; i < string.length; i++) {
		hash = (hash << 5) - hash + string.charCodeAt(i);
		hash |= 0;

	}
	return Math.abs(hash);
}


/**
 * Deterministically turn a given string into a valid hsl() CSS color.
 * @param {string} string
 * @returns {string} hsl(h s l)
 */
export function stringToHslColor(string) {
	let stringHash = hashStringToNumber(string);
	let h = stringHash % 361; // puts stringHash between 0 and 360 for the hue value
	let s = "75%";
	let l = "50%";
	return `hsl(${h} ${s} ${l})`;
}

/**
 * Deterministically turn a given string into a valid oklch() CSS color.
 * @param {string} string
 * @returns {string} oklch(l% c h)
 */
export function stringToOklchColor(string) {
	let stringHash = divergentStringToNumber(string);
	let h = stringHash % 361; // Put stringHash between 0 and 360 for the hue value
	let c = "0.2"
	let l = "55%";
	return `oklch(${l} ${c} ${h})`;
}

