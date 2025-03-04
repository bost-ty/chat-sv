<script>
	import Chat from "./lib/Chat.svelte";

	let targetChannel = $state("");
	let value = $state("");
	let submitted = $state(false);

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
			/>
		</label>
		<button type="submit">{!submitted ? "Connect" : "Disconnect"}</button>
	</form>
	{#if submitted}
		<h2>{targetChannel}</h2>
		<Chat {targetChannel} />
	{/if}
</section>

<style>
	form {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;
	}
	section {
		max-height: 100svh;
	}
</style>
