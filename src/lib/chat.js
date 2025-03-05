/**
 *
 * @param {string} ircMessage
 * @returns {{date: string, username: string, message: string}}
 */

export function parseIrc(ircMessage) {
	const d = new Date();
	const date = d.toLocaleTimeString("en-US", { hourCycle: "h23" }).slice(0, 10);
	const username = ircMessage.split("!")[0].slice(1)?.trim();
	const message = ircMessage.split(":")[2]?.trim();
	return { date, username, message };
}
/**
 * Scroll an element to its bottom *after render*.
 * @param {HTMLElement} element
 */
export function scrollBottom(element) {
	setTimeout(() => {
		element.scrollTop = element.scrollHeight - element.clientHeight;
	}, 0); // Uses a timeout of 0ms to defer until end of render cycle
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
