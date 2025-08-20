<script lang="ts">
	import {
		MessageSquareOff,
		SquareMousePointer,
		SquareDashedMousePointer,
	} from "lucide-svelte";

	import ChatLog from "./ChatLog.svelte";

	import { sharedState } from "./state.svelte";
	let { targetChannel } = $props();

	let pauseOnHover = $state(true);
	let intervalS = $state(15);
	let messages = $state([]);

	let now = $state(Date.now());

	const getRate = () => {
		const intervalMsAgo = now - intervalS * 1000;
		return messages.filter((msg) => msg.timestamp > intervalMsAgo).length;
	};

	let chatRate = $derived.by(getRate);

	/**
	 * Update the chatRate every second,
	 * rather than every new chat or every `chatRate` seconds,
	 * to allow the rate to go down when messages aren't arriving.
	 */
	$effect(() => {
		const nowUpdateInterval = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(nowUpdateInterval);
	});

	function disconnectChannel(channel: string) {
		sharedState.channels = sharedState.channels.filter(
			(ch) => ch !== channel,
		);
		sharedState.formMessage = `Disconnected from ${channel}.`;
		const url = new URL(window.location.href);
		if (sharedState.channels.length === 0) {
			url.searchParams.delete("channels");
		} else {
			url.searchParams.set("channels", sharedState.channels.join("-"));
		}
		history.pushState({}, "", url.href);
	}
</script>

<div class="chatManager" >
	<div class="chatHeader" >
		<div style="display: flex; flex-flow: row nowrap; align-items: center; gap: 0.3rem;" >
			<h2>
				{targetChannel}
			</h2>
				<button
					type="button"
					onclick={() => disconnectChannel(targetChannel)}
					>
				<MessageSquareOff size={16} />Disconnect</button
				>
				<button
					type="button"
					onclick={() => {
						pauseOnHover = !pauseOnHover;
					}}
					>
					{#if pauseOnHover}
						<SquareMousePointer size={18} />
					{:else}
						<SquareDashedMousePointer size={18} />
					{/if}
					{pauseOnHover ? "Hold" : "Scroll"} on hover
				</button >
				<div class="chatRate">
					<span class="rn">{chatRate}</span>&nbsp;chats per
					<input
						type="number"
						min="1"
						step="1"
						max="60"
						bind:value={intervalS}
					/> s.
				</div>
		</div>
	</div>
		<ChatLog {targetChannel} {pauseOnHover} bind:messages />
</div>

<style>
	h2 {
		font-size: clamp(0.8rem, 0.8rem + 1svw, 1.2rem);
	}
	button {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}
	.chatManager {
		margin-inline: clamp(0rem, calc(0.1rem + 1svw), 0.3rem);
		margin-top: 0.3rem;
		padding-bottom: 0.3rem;
		position: relative;
		flex: 1 0 36%;
		max-width: 49dvw;
	}
	.chatHeader {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: space-between;
		gap: clamp(0rem, calc(0.1rem + 1svw), 0.3rem);
		padding-inline: clamp(0rem, calc(0.1rem + 1svw), 0.3rem);
	}
	.chatRate {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		flex-shrink: 0;
		width: 12rem;
	}
	.chatRate input[type=number] {
		width: 3ch;
		text-align: center;
		margin-inline: 0.1em;
		appearance: none;
		border: none;

		&::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
	}
	.rn {
		font-family: monospace;
		width: fit-content;
		text-align: center;
	}
</style>
