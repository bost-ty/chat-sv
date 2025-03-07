<script lang="ts">
	import { onMount, onDestroy, tick } from "svelte";
	import { fade } from "svelte/transition";

	import ChatMessage from "./ChatMessage.svelte";

	import { parseIrc } from "./chat";

	const TWITCH_IRC_WS = "wss://irc-ws.chat.twitch.tv:443";
	const NICKNAME = "justinfan1337";

	let chats: HTMLDivElement; // Binding for the `chats` div in this component

	let { targetChannel, pauseOnHover, messages = $bindable() } = $props();
	let isHovered = $state(false); // "Are we hovering the chat?"
	/* pauseOnHover // "Should we care about hovering the chat?" */
	// "Should we pause chat scroll?"
	let pauseChatScroll = $derived.by(() => {
		if (!pauseOnHover) return false;
		if (isHovered) return true;
	});

	const scrollToBottom = () => {
		chats.scrollTop = chats.scrollHeight - chats.clientHeight;
	};

	$effect(() => {
		if (!pauseChatScroll) scrollToBottom();
	});

	let ws: WebSocket;

	onMount(() => {
		ws = new WebSocket(TWITCH_IRC_WS);

		ws.addEventListener("open", (_e) => {
			ws.send(`NICK ${NICKNAME}`);
			ws.send(`JOIN #${targetChannel}`);
			console.log(`WebSocket opened for ${targetChannel}`);
		});

		ws.addEventListener("message", (e) => {
			// Ignore self messages & handle pings
			if (e.data.includes(NICKNAME)) return;
			if (e.data.includes("PING")) ws.send(`PONG ${e.data}`);
			messages.push(parseIrc(e.data));
			if (!pauseChatScroll) tick().then(() => scrollToBottom());
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
	class="chatLog {pauseOnHover ? '' : 'noPause'}"
	role="list"
	bind:this={chats}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	{#each messages as { timestamp, username, message }}
		<ChatMessage {timestamp} {username} {message} />
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
		scrollbar-color: var(--spa) hsla(from var(--spa) h s l / 5%);
		transition: border-color 100ms linear;
	}
	.chatLog:hover {
		border-color: var(--sp);
		scrollbar-color: var(--sp) var(--spa);
	}
	.noPause:hover {
		border-color: hsla(from var(--spa) h s l / 20%);
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
