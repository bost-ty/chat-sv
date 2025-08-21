<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Attachment } from 'svelte/attachments';

	import ChatMessage from './ChatMessage.svelte';

	type Message = {
		timestamp: Date;
		username: string;
		message: string;
		id?: string;
	};

	interface Props {
		pauseOnHover: boolean;
		messages: Message[];
	}

	let { pauseOnHover, messages }: Props = $props();

	const ESTIMATED_HEIGHT = 28;
	const OVERSCAN_COUNT = 10;

	let chatLogElement: HTMLDivElement | undefined = $state();
	let clientHeight = $state(0);
	let scrollTop = $state(0);
	let isHovered = $state(false);

	let isScrollScheduled = false;

	function onScroll() {
		if (!isScrollScheduled && chatLogElement) {
			isScrollScheduled = true;
			requestAnimationFrame(() => {
				scrollTop = chatLogElement!.scrollTop;
				isScrollScheduled = false;
			});
		}
	}

	const isAtBottom = $derived(
		!chatLogElement || chatLogElement.scrollHeight - chatLogElement.scrollTop - clientHeight < 1
	);

	const isPaused = $derived(pauseOnHover && (isHovered || !isAtBottom));
	const pauseMessage = $derived(isHovered ? 'Chat paused due to hover' : 'Chat paused due to scroll');

	function scrollToBottom() {
		if (chatLogElement) {
			chatLogElement.scrollTop = chatLogElement.scrollHeight;
		}
	}

	function handleMouseLeave() {
		isHovered = false;
		scrollToBottom();
	}

	const localIds = new WeakMap<Message, string>();
	let nextId = 0;
	function getMessageId(message: Message): string {
		if (message.id) {
			return message.id;
		}
		if (!localIds.has(message)) {
			localIds.set(message, `local-${nextId++}`);
		}
		return localIds.get(message)!;
	}

	let measuredHeights = $state(new Map<string, number>());

	const virtual = $derived.by(() => {
		let totalHeight = 0;
		const items: { id: string; message: Message; top: number; height: number }[] = [];

		for (const message of messages) {
			const id = getMessageId(message);
			const height = measuredHeights.get(id) ?? ESTIMATED_HEIGHT;
			items.push({ id, message, top: totalHeight, height });
			totalHeight += height;
		}

		if (items.length === 0) {
			return { totalHeight: 0, visibleItems: [] };
		}

		let low = 0;
		let high = items.length - 1;
		let firstIndex = items.length;

		while (low <= high) {
			const mid = (low + high) >> 1;
			if (items[mid].top + items[mid].height >= scrollTop) {
				firstIndex = mid;
				high = mid - 1;
			} else {
				low = mid + 1;
			}
		}

		let end = firstIndex;
		while (end < items.length && items[end].top < scrollTop + clientHeight) {
			end++;
		}

		const startIndex = Math.max(0, firstIndex - OVERSCAN_COUNT);
		const endIndex = Math.min(items.length, end + OVERSCAN_COUNT);

		return {
			totalHeight,
			visibleItems: items.slice(startIndex, endIndex)
		};
	});

	let wasAnchored = true;
	let prevScrollHeight = 0;

	$effect.pre(() => {
		if (!chatLogElement) return;
		virtual.totalHeight;

		wasAnchored =
			chatLogElement.scrollHeight - chatLogElement.scrollTop - chatLogElement.clientHeight < 1;

		if (!wasAnchored) {
			prevScrollHeight = chatLogElement.scrollHeight;
		}
	});

	$effect(() => {
		if (!chatLogElement) return;
		virtual.totalHeight;

		if (isPaused) {
			return;
		}

		if (wasAnchored) {
			chatLogElement.scrollTop = chatLogElement.scrollHeight;
		} else {
			chatLogElement.scrollTop += chatLogElement.scrollHeight - prevScrollHeight;
		}
	});

	function measure(id: string): Attachment {
		return (node) => {
			const ro = new ResizeObserver((entries) => {
				const height = entries[0].contentRect.height;
				if (measuredHeights.get(id) !== height) {
					const newHeights = new Map(measuredHeights);
					newHeights.set(id, height);
					measuredHeights = newHeights;
				}
			});

			ro.observe(node);

			return () => ro.disconnect();
		};
	}
</script>

<div class="container">
	<div
		class="chatLog"
		role="list"
		bind:this={chatLogElement}
		bind:clientHeight
		onscroll={onScroll}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={handleMouseLeave}
	>
		<div
			style:height="{virtual.totalHeight}px"
			style="position: relative; min-height: 100%; width: 100%;"
		>
			{#each virtual.visibleItems as item (item.id)}
				<div
					style="position: absolute; top: {item.top}px; left: 0; right: 0;"
					{@attach measure(item.id)}
				>
					<ChatMessage
						timestamp={item.message.timestamp}
						username={item.message.username}
						message={item.message.message}
					/>
				</div>
			{/each}
		</div>
	</div>

	{#if isPaused}
		<div transition:fade={{ duration: 100 }} class="hoverMessage">
			{pauseMessage}
		</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		height: 80svh;
	}
	.chatLog {
		position: absolute;
		inset: 0;
		padding: 0.1rem 0.3rem;
		border-radius: 0.1rem;
		margin: 0;
		background-color: hsl(from var(--bg) h s calc(l * 0.8));
		overflow-y: scroll;
		overflow-x: hidden;
		white-space: break-word;
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
	.chatLog:not(:hover) {
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
		z-index: 10;
		pointer-events: none;
	}
</style>
