<script>
	import Chat from "./lib/Chat.svelte";
	import { fade } from "svelte/transition";

	let targetChannel = $state("");
	let value = $state("");
	let isHovered = $state(false);

	let channels = $state([]);

	function handleSubmit(e) {
		e.preventDefault();
		targetChannel = value.toLowerCase();
		channels.push(targetChannel);
		value = "";
	}

	function disconnectChannel(channel) {
		channels = channels.filter((ch) => ch !== channel);
	}
</script>

<!-- This whole <section> could be extracted into a component and reused! -->
<section>
	<form onsubmit={handleSubmit}>
		<label>Enter channel name: <input type="text" bind:value /> </label>
		<button type="submit">Connect to channel</button>
	</form>
	<div>
		{#each channels as targetChannel (targetChannel)}
			<div
				transition:fade={{ duration: 100 }}
				style="display: flex; align-items: center; gap: 1rem;"
			>
				<h2>{targetChannel}</h2>
				<button type="button" onclick={() => disconnectChannel(targetChannel)}
					>Disconnect</button
				>
			</div>
			<Chat {targetChannel} bind:isHovered />
			{#if isHovered}
				<div transition:fade={{ duration: 100 }} class="hoverMessage">
					Scroll paused due to hover
				</div>
			{/if}
		{/each}
	</div>
</section>

<style>
	section {
		position: relative;
		height: 100%;
		width: 100%;
		margin: 0 auto;
	}
	form {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;
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
