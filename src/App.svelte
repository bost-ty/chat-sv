<script>
	import Chat from "./lib/Chat.svelte";

	let targetChannel = $state("");
	let value = $state("");
	let submitted = $state(false);

	function handleSubmit(e) {
		e.preventDefault();
		submitted = true;
		targetChannel = value.toLowerCase();
	}
</script>

<section>
	<form onsubmit={handleSubmit}>
		<label
			>Enter channel name: <input
				type="text"
				placeholder="AlveusSanctuary"
				bind:value
			/>
		</label>
		<button type="submit">Connect</button>
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
