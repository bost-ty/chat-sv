<script>
	import { MessageSquarePlus } from "lucide-svelte";
	import ChatManager from "./lib/ChatManager.svelte";
	import { sharedState } from "./lib/state.svelte";

	// Load and connect to channels from URL
	// https://example.com/?channels=MyChannelName,YourChannelName
	const url = new URL(window.location.href);
	const channelState = url.searchParams.get("channels");
	sharedState.channels = channelState ? channelState.split("-") : [];

	let targetChannel = $state("");
	let value = $state("");

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
		url.searchParams.set("channels", sharedState.channels.join("-"));
		history.pushState({}, "", url.href);
		value = "";
	}
</script>

<section>
	<form onsubmit={handleSubmit}>
		<label
			>Enter channel name: <input
				id="channelInput"
				type="text"
				bind:value
				autocomplete="off"
			/>
		</label>
		<button type="submit"><MessageSquarePlus size={18} />Connect</button>
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
	}
	.chatsContainer {
		display: flex;
		flex-flow: row wrap;
	}
</style>
