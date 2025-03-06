<script lang="ts">
	import { fade } from "svelte/transition";
	import { onMount, onDestroy } from "svelte";
	import ChatMessage from "./ChatMessage.svelte";
	import { parseIrc, scrollBottom } from "./chat";

	let { targetChannel, pauseOnHover } = $props();
	let isHovered = $state(false);

	const TWITCH_IRC_WS = "wss://irc-ws.chat.twitch.tv:443";
	const NICKNAME = "justinfan1337";

	let chats: HTMLDivElement;
	let messages = $state([]);

	$effect(() => {
		if (!pauseOnHover) isHovered = false;
		if (!isHovered && chats && messages) scrollBottom(chats);
	});

	let ws: WebSocket;

	onMount(() => {
		ws = new WebSocket(TWITCH_IRC_WS);

		ws.addEventListener("open", (_e) => {
			ws.send(`NICK ${NICKNAME}`);
			ws.send(`JOIN #${targetChannel}`);
		});

		ws.addEventListener("message", (e) => {
			// Ignore self messages and pings
			if (e.data.includes(NICKNAME) || e.data.includes("PING")) return;
			messages.push(parseIrc(e.data));
			if (!isHovered && chats) scrollBottom(chats);
		});

		ws.addEventListener("error", (e) => console.error(e));

		ws.addEventListener("close", (_e) =>
			console.log(`WebSocket closed for ${targetChannel}`)
		);
	});

	onDestroy(() => {
		ws.close();
	});
</script>

<div
	id="chats"
	class="chatLog"
	role="list"
	bind:this={chats}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	{#each messages as { time, username, message }}
		<ChatMessage {time} {username} {message} />
	{/each}
	{#if isHovered && pauseOnHover}
		<div transition:fade={{ duration: 100 }} class="hoverMessage">
			Scroll paused due to hover
		</div>
	{/if}
</div>

<style>
	.chatLog {
		padding: 0.1rem 0.3rem;
		border-radius: 0.1rem;
		margin: 0;
		background-color: hsl(from var(--bg) h s calc(l * 0.9));
		overflow-y: scroll;
		overflow-x: hidden;
		white-space: break-word;
		height: 80svh;
		border: 1px solid transparent;
		--sp: hsl(from var(--ac) h s calc(l * 0.8));
		--spa: hsla(from var(--sp) h s l / 20%);
		scrollbar-width: thin;
		scrollbar-color: var(--spa) transparent;
		transition: border-color 100ms linear;
	}

	.chatLog:hover {
		border-color: var(--sp);
		scrollbar-color: var(--sp) var(--spa);
	}

	.hoverMessage {
		position: absolute;
		bottom: 2rem;
		left: 0;
		right: 0;
		border-radius: 0.1rem;
		padding: 0.6rem 1.2rem;
		width: fit-content;
		margin-inline: auto;
		text-align: center;
		background-color: var(--int);
		border: 1px solid var(--ac);
		color: var(--fg);
	}
</style>
