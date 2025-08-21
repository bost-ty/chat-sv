<script lang="ts">
	import { MessageSquarePlus } from "lucide-svelte";
	import ChatManager from "./lib/ChatManager.svelte";
	import { sharedState } from "./lib/state.svelte";
	import { getChannelsFromQueryParams } from "./lib/utils/params";

	const url = new URL(window.location.href);
	const channelState = getChannelsFromQueryParams(window.location.href);
	sharedState.channels = channelState ? channelState.split("-") : [];

	let targetChannel = $state("");
	let value = $state("");

	function handleSubmit(e: Event) {
		e.preventDefault();
		const twitchUsernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,23}$/;
		sharedState.formMessage = "";
		if (!value || !twitchUsernameRegex.test(value)) {
			sharedState.formMessage =
				"Please enter a valid Twitch channel username.";
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
		/* position: relative; */
		/* height: 100%; */
		/* width: 100%; */
		margin: 0 auto;
	}
	form {
		display: flex;
		gap: 1rem;
		align-items: center;
		background-color: hsla(from var(--bg) h calc(s * 1.2) calc(l * 0.9));
		padding: 0.3rem 0.6rem;
	}
	.chatsContainer {
		display: flex;
		flex-flow: row wrap;
		align-items: start;
		overflow-x: hidden;
	}
	.formMessage {
		line-height: 1;
		text-align: center;
		margin-left: auto;
		color: var(--ac);
	}
</style>
