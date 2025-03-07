<script>
	import { stringToHslColor } from "./chat";
	let { timestamp, username, message } = $props();
	let time = timestamp.toLocaleTimeString("en-US", { hourCycle: "h23" }).slice(0, 10);
</script>

<div>
	<span class="time">{time}</span>
	<span class="username" style:color={stringToHslColor(username)}>{username}</span><span
		class="separator">:</span
	>&nbsp;<span class="message">{message}</span>
</div>

<style>
	div {
		padding: 0;
		margin: 0.1rem 0;
		line-height: 1.3;
		max-width: 40ch;
	}
	.time {
		font-size: 0.7rem;
		color: var(--ac);
		padding-right: 0.1rem;
	}
	.username {
		font-weight: 700;
		letter-spacing: 0.01rem;
	}
</style>
