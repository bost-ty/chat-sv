<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { Attachment } from "svelte/attachments";

	import ChatMessage from "./ChatMessage.svelte";

	interface Message {
		timestamp: Date;
		username: string;
		message: string;
	}

	let {
		pauseOnHover,
		messages = $bindable()
	}: {
		pauseOnHover: boolean;
		messages: Message[];
	} = $props();

	const ESTIMATED_HEIGHT = 28; // px
	const OVERSCAN_COUNT = 10;

	let chatLogElement: HTMLDivElement;

	let clientHeight = $state(0);
	let scrollTop = $state(0);
	let isHovered = $state(false);
	let previousMessagesLength = $state(messages.length);

	let scrollAdjustment = $state(0);

	let pauseChatScroll = $derived(pauseOnHover && isHovered);
	let measuredHeights = $state(new Map<Message, number>());

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

	const visibleItems = $derived.by(() => {
		const { items } = itemsWithPositions;
		if (items.length === 0) return [];

		let low = 0;
		let high = items.length - 1;
		let firstIndex = items.length;
		while (low <= high) {
			const mid = low + ((high - low) >> 1);
			if (items[mid].top >= scrollTop) {
				firstIndex = mid;
				high = mid - 1;
			} else {
				low = mid + 1;
			}
		}

		const start = Math.max(0, firstIndex - 1);
		let end = start;
		while (end < items.length && items[end].top < scrollTop + clientHeight) {
			end++;
		}

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

			const ro = new ResizeObserver((entries) => {
				updateHeight(entries[0].contentRect.height);
			});

			ro.observe(node);

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

		if (messages.length > previousMessagesLength && !pauseChatScroll) {
			scrollToBottom();
		}

		previousMessagesLength = messages.length;
	});

	onMount(() => {
		scrollToBottom();
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
