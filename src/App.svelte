<script>
	import { SquarePlus } from "lucide-svelte";
	import ChatManager from "./lib/ChatManager.svelte";
	import { sharedState } from "./lib/state.svelte";

	let targetChannel = $state("");
	let value = $state("");

	$inspect(sharedState.channels);

	function handleSubmit(e) {
		e.preventDefault();
		const twitchUsernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,23}$/;
		sharedState.formMessage = "";
		if (!value || !twitchUsernameRegex.test(value)) {
			sharedState.formMessage = "Please enter a valid Twitch channel username.";
			value = "";
			return;
		}
		targetChannel = value.toLowerCase();
		if (sharedState.channels.includes(targetChannel)) {
			sharedState.formMessage = `Already connected to ${targetChannel}!`;
			value = "";
			return;
		}
		sharedState.formMessage = `Connected to ${targetChannel}!`;
		sharedState.channels.push(targetChannel);
		value = "";
	}
</script>

<section>
	<form onsubmit={handleSubmit}>
		<label>Enter channel name: <input type="text" bind:value /> </label>
		<button type="submit"><SquarePlus size={20} />Connect to channel</button>
		{#if sharedState.formMessage}
			<span class="formMessage">
				{sharedState.formMessage}
			</span>
		{/if}
	</form>
	<div class="chatsContainer">
		{#each sharedState.channels as targetChannel (targetChannel)}
			<ChatManager {targetChannel} />
		{/each}
	</div>
</section>

<style>
	button {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		gap: 0.3rem;
	}
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
	.formMessage {
		margin-left: 1rem;
	}
	.chatsContainer {
		display: flex;
		flex-flow: row wrap;
		gap: 1rem;
	}
</style>
