export function parseIrc(msg) {
	const d = new Date();
	const username = msg.split("!")[0].slice(1)?.trim();
	const txt = msg.split(":")[2]?.trim();
	return [
		d.toLocaleTimeString("en-US", { hourCycle: "h23" }).slice(0, 10),
		username,
		txt,
	];
}
export function scrollBottom(element) {
	setTimeout(() => {
		element.scrollTop = element.scrollHeight - element.clientHeight;
	}, 0);
}
