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
	<div style="display: flex; align-items: center; gap: 1rem;">
		<h2>{targetChannel}</h2>
		<button type="button" onclick={() => disconnectChannel(targetChannel)}
			><SquareMinus size={20} />Disconnect</button
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
		position: relative;
		flex: 1 0 21%;
	}

	.hoverMessage {
		position: absolute;
		bottom: 1rem;
		left: 0;
		right: 0;
		background-color: hsl(150, 1%, 20%);
		width: fit-content;
		padding: 0.2rem 0.6rem;
		margin-inline: auto;
		text-align: center;
		pointer-events: none;
		outline: 1px solid lightgrey;
		color: lightgrey;
		border-radius: 0.3rem;
		font-weight: 500;
	}
</style>
