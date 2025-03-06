<script>
	import {
		MessageSquareOff,
		SquareMousePointer,
		SquareDashedMousePointer,
	} from "lucide-svelte";
	import ChatLog from "./ChatLog.svelte";
	import { sharedState } from "./state.svelte";
	let { targetChannel } = $props();

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
			><MessageSquareOff size={16} />Disconnect</button
		>
		<button
			type="button"
			onclick={() => {
				pauseOnHover = !pauseOnHover;
			}}
			>{#if pauseOnHover}<SquareMousePointer
					size={18}
				/>{:else}<SquareDashedMousePointer size={18} />{/if}{pauseOnHover
				? "P"
				: "Not p"}ausing on hover</button
		>
	</div>
	<ChatLog {targetChannel} {pauseOnHover} />
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
</style>
