<script lang="ts">
	import { onMount } from "svelte";
	import ChatMessage from "./ChatMessage.svelte";
	import { getPseudorandomHslColor, parseIrc, scrollBottom } from "./chat";

	let { targetChannel } = $props();

	const TWITCH_IRC_WS = "wss://irc-ws.chat.twitch.tv:443";
	const NICKNAME = "justinfan1337";

	let chats: HTMLDivElement;
	let messages = $state([]);
	let isHovered = $state(false);

	$effect(() => {
		if (!isHovered && chats && messages) scrollBottom(chats);
	});

	onMount(() => {
		const ws = new WebSocket(TWITCH_IRC_WS);

		ws.addEventListener("open", (e) => {
			ws.send(`NICK ${NICKNAME}`);
			ws.send(`JOIN #${targetChannel}`);
		});

		ws.addEventListener("message", (e) => {
			if (e.data.includes(NICKNAME)) return;
			messages.push(parseIrc(e.data));
			if (!isHovered && chats) scrollBottom(chats);
		});

		ws.addEventListener("error", (e) => {
			console.error(e);
		});
	});
</script>

<div
	id="chats"
	class="chats"
	role="list"
	bind:this={chats}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	{#each messages as [time, username, message]}
		<ChatMessage {time} {username} {message} />
	{/each}
</div>

<style>
	.chats {
		list-style: none;
		padding: 1rem;
		margin: 0;
		background-color: hsl(150, 10%, 10%);
		overflow-y: scroll;
		overflow-x: hidden;
		white-space: break-word;
		scrollbar-width: thin;
		height: 80vh;
		width: 50ch;
		position: relative;
	}

	.chats:hover {
		outline: 1px solid white;
	}
</style>
