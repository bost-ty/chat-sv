<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import ChatMessage from "./ChatMessage.svelte";
	import { parseIrc, scrollBottom } from "./chat";

	let { isHovered = $bindable(), targetChannel } = $props();

	const TWITCH_IRC_WS = "wss://irc-ws.chat.twitch.tv:443";
	const NICKNAME = "justinfan1337";

	let chats: HTMLDivElement;
	let messages = $state([]);

	$effect(() => {
		if (!isHovered && chats && messages) scrollBottom(chats);
	});

	let ws: WebSocket;

	onMount(() => {
		ws = new WebSocket(TWITCH_IRC_WS);

		ws.addEventListener("open", (e) => {
			ws.send(`NICK ${NICKNAME}`);
			ws.send(`JOIN #${targetChannel}`);
		});

		ws.addEventListener("message", (e) => {
			// Ignore self messages and pings
			if (e.data.includes(NICKNAME) || e.data.includes("PING")) return;
			messages.push(parseIrc(e.data));
			if (!isHovered && chats) scrollBottom(chats);
		});

		ws.addEventListener("error", (e) => {
			console.error(e);
		});

		ws.addEventListener("close", (e) => {
			console.log(`WebSocket closed for ${targetChannel}`);
		});
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
</div>

<style>
	.chatLog {
		padding: 0.1rem 0.3rem;
		margin: 0;
		background-color: hsl(150, 1%, 10%);
		overflow-y: scroll;
		overflow-x: hidden;
		white-space: break-word;
		scrollbar-width: thin;
		width: 100%;
		height: 85svh;
		border-radius: 0.3rem;
		outline: 0.1rem solid transparent;
	}

	.chatLog:hover {
		outline: 0.1rem solid lightgrey;
	}
</style>
