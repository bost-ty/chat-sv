<script>
	import Chat from "./lib/Chat.svelte";
	import { fade } from "svelte/transition";

	let targetChannel = $state("");
	let value = $state("");
	let submitted = $state(false);
	let isHovered = $state(false);

	function handleSubmit(e) {
		e.preventDefault();
		if (!submitted) {
			submitted = true;
			targetChannel = value.toLowerCase();
		} else {
			submitted = false;
			value = "";
			targetChannel = value;
		}
	}
</script>

<!-- This whole <section> could be extracted into a component and reused! -->
<section>
	<form onsubmit={handleSubmit}>
		<label
			>Enter channel name: <input
				type="text"
				placeholder="AlveusSanctuary"
				bind:value
				disabled={submitted}
			/>
		</label>
		<button type="submit">{!submitted ? "Connect" : "Disconnect"}</button>
	</form>
	{#if submitted}
		<h2 transition:fade={{ duration: 100 }}>{targetChannel}</h2>
		<Chat {targetChannel} bind:isHovered />
	{/if}

	{#if isHovered}
		<div transition:fade={{ duration: 100 }} class="hoverMessage">
			Scroll paused due to hover
		</div>
	{/if}
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
