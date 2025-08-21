<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import type { Attachment } from "svelte/attachments";

	import ChatMessage from "./ChatMessage.svelte";
	import { parseIrc } from "./chat";
	import { sharedState } from "./state.svelte";

	interface Message {
		timestamp: Date;
		username: string;
		message: string;
	}

	let {
		targetChannel,
		pauseOnHover,
		messages = $bindable()
	}: {
		targetChannel: string;
		pauseOnHover: boolean;
		messages: Message[];
	} = $props();

	const TWITCH_IRC_WS = "wss://irc-ws.chat.twitch.tv:443";
	const NICKNAME = "justinfan1337";
	const ESTIMATED_HEIGHT = 28; // px
	const OVERSCAN_COUNT = 10;

	let chatLogElement: HTMLDivElement;

	let clientHeight = $state(0);
	let scrollTop = $state(0);
	let isHovered = $state(false);
	let shouldScrollToBottom = $state(true);

	let scrollAdjustment = $state(0); // Testing the $effect.pre answer...

	let pauseChatScroll = $derived(pauseOnHover && isHovered);

	// The cache of measured heights. This is the only place where heights are written to.
	let measuredHeights = $state(new Map<Message, number>());

	// This derived value declaratively calculates the position of every item and the total height.
	// It's a pure function, re-running only when `messages` or `measuredHeights` change.
	const itemsWithPositions = $derived.by(() => {
		let currentTop = 0;
		const items = [];
		for (const message of messages) {
			const height = measuredHeights.get(message) ?? ESTIMATED_HEIGHT;
			items.push({ message, top: currentTop, height });
			currentTop += height;
		}
		return { items, totalHeight: currentTop };
	});

	// This derived value uses a performant binary search to find the visible items.
	const visibleItems = $derived.by(() => {
		const { items } = itemsWithPositions;
		if (items.length === 0) return [];

		// Identify the first item that starts at or after the viewport's top edge,
		// then step back one by one to handle any tall items that started above the viewport but *extend into it* are included.
		let low = 0;
		let high = items.length - 1;
		let firstIndex = items.length;
		while (low <= high) {
			const mid = low + ((high - low) >> 1);
			if (items[mid].top >= scrollTop) {
				firstIndex = mid;
				high = mid - 1;
			} else {
				low = mid + 1
			}
		}

		const start = Math.max(0, firstIndex - 1);
		let end = start;
		while (end < items.length && items[end].top < scrollTop + clientHeight) {
			end++;
		}

		// Overscan to also render items outside the virtualized viewport
		const startIndex = Math.max(0, start - OVERSCAN_COUNT);
		const endIndex = Math.min(items.length - 1, end + OVERSCAN_COUNT);

		const visible = [];
		for (let i = startIndex; i <= endIndex; i++) {
			visible.push(items[i]);
		}

		return visible;
	});


	function measure(message: Message, top: number): Attachment<HTMLElement> {
	return (node) => {
		const updateHeight = (newHeight: number) => {
			const oldHeight = measuredHeights.get(message) ?? ESTIMATED_HEIGHT;
			const heightDifference = newHeight - oldHeight;

			if (Math.abs(heightDifference) < 1) return;

			if (top < scrollTop) scrollAdjustment += heightDifference;

			measuredHeights.set(message, newHeight);
		};


		// Use a ResizeObserver to handle any subsequent changes.
		const ro = new ResizeObserver((entries) => {
			updateHeight(entries[0].contentRect.height);
		});

		ro.observe(node);

		// Perform an initial, synchronous measurement as soon as the element is mounted.
		updateHeight(node.offsetHeight);
		return () => ro.disconnect();
	};
}

$effect.pre(() => {
	if (scrollAdjustment !== 0) {
		chatLogElement.scrollTop += scrollAdjustment;
		scrollAdjustment = 0;
	}
});

	const scrollToBottom = () => {
		if (chatLogElement) {
			chatLogElement.scrollTop = chatLogElement.scrollHeight - chatLogElement.clientHeight;
		}
	};

	$effect(() => {
		itemsWithPositions.totalHeight;
		if (shouldScrollToBottom && !pauseChatScroll) {
			scrollToBottom();
			if (
				chatLogElement.scrollTop + clientHeight >=
				itemsWithPositions.totalHeight - 1
			) {
				shouldScrollToBottom = false;
			}
		}
	});

	let ws: WebSocket;

	onMount(() => {
		scrollToBottom();
		ws = new WebSocket(TWITCH_IRC_WS);

		ws.addEventListener("open", () => {
			ws.send(`NICK ${NICKNAME}`);
			ws.send(`JOIN #${targetChannel}`);
			console.log(`WebSocket opened for ${targetChannel}`);
			sharedState.formMessage = `WebSocket opened for ${targetChannel}`;
		});

		ws.addEventListener("message", (e) => {
			if (e.data.includes(NICKNAME)) return;
			if (e.data.includes("PING")) {
				ws.send(`PONG ${e.data}`);
				return;
			}
			messages.push(parseIrc(e.data));
			if (!pauseChatScroll) {
				shouldScrollToBottom = true;
			}
		});

		ws.addEventListener("error", (e) => console.error(e));

		ws.addEventListener("close", () => {
			console.log(`WebSocket closed for ${targetChannel}`);
			sharedState.formMessage = `WebSocket closed for ${targetChannel}`;
		});
	});

	onDestroy(() => {
		ws.close();
	});
</script>

<div
	class="chatLog {pauseOnHover ? '' : 'noPause'}"
	role="list"
	bind:this={chatLogElement}
	bind:clientHeight
	onscroll={(e) => (scrollTop = (e.currentTarget as HTMLDivElement).scrollTop)}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<div style="position: relative; height: {itemsWithPositions.totalHeight}px; min-height: 100%;">
		{#each visibleItems as item (item.message)}
			<div
				style="position: absolute; top: {item.top}px; left: 0; right: 0;"
				{@attach measure(item.message, item.top)}
			>
				<ChatMessage
					timestamp={item.message.timestamp}
					username={item.message.username}
					message={item.message.message}
				/>
			</div>
		{/each}
	</div>

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
		background-color: hsl(from var(--bg) h s calc(l * 0.8));
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
