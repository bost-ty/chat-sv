<script>
	import { onMount } from "svelte";
	import Chat from "./lib/Chat.svelte";
</script>

<section>
	<Chat targetChannel={"jynxzi"} />
</section>

<style>
	section {
		max-height: 80svh;
	}
</style>
