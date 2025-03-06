<script>
	import { fade } from "svelte/transition";
	import { SquareMinus } from "lucide-svelte";
	import ChatLog from "./ChatLog.svelte";
	import { sharedState } from "./state.svelte";
	let { targetChannel } = $props();

	let isHovered = $state(false);

	let pauseOnHover = $state(true);

	function disconnectChannel(channel) {
		sharedState.channels = sharedState.channels.filter((ch) => ch !== channel);
		sharedState.formMessage = `Disconnected from ${channel}.`;
	}
</script>

<div class="chatManager">
	<div class="chatHeader">
		<h2>{targetChannel}</h2>
		<button type="button" onclick={() => disconnectChannel(targetChannel)}
			><SquareMinus size={18} />Disconnect</button
		>
		<button type="button" onclick={() => {}}>Pause on hover</button>
	</div>
	<ChatLog {targetChannel} bind:isHovered />
	{#if isHovered}
		<div transition:fade={{ duration: 100 }} class="hoverMessage">
			Scroll paused due to hover
		</div>
	{/if}
</div>

<style>
	button {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		gap: 0.3rem;
	}
	.chatManager {
		margin-inline: 1rem;
		position: relative;
		flex: 1 0 21%;
	}

	.chatHeader {
		display: flex;
		align-items: center;
		gap: 1rem;
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
		pointer-events: none;
	}
</style>
