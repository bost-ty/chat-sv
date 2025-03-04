<script>
	let { time, username, message } = $props();
</script>

<div>
	<span class="time">{time}</span>
	<span class="username">{username}</span><span class="separator">:&nbsp;</span><span
		class="message">{message}</span
	>
</div>

<style>
	div {
		padding: 0;
		margin: 0.1rem 0;
		line-height: 1.3;
	}
	.time {
		font-size: 0.9rem;
		color: lightgrey;
		padding-right: 0.1rem;
	}
	.username {
		font-weight: 700;
		letter-spacing: 0.01rem;
		background-color: rgb(44, 44, 44);
		color: lightgrey;
	}
</style>
