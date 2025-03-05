<script>
	import { fade } from "svelte/transition";
	import { SquareMinus } from "lucide-svelte";
	import ChatLog from "./ChatLog.svelte";
	import { sharedState } from "./state.svelte";
	let { targetChannel } = $props();

	let isHovered = $state(false);

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
		bottom: 1rem;
		left: 0;
		right: 0;
		border-radius: 0.3rem;
		padding: 0.2rem 0.6rem;
		width: fit-content;
		margin-inline: auto;
		text-align: center;
		font-weight: 500;
		background-color: var(--bg);
		outline: 1px solid var(--ac);
		pointer-events: none;
	}
</style>
