# chat-sv

A simple frontend for reading Twitch chat. Built with Svelte 5.

## Details

- Runs entirely in the browser
- Connects to Twitch anonymously
- Provides a customizable "chats per X minutes" display
- Does not implement virtualization, so with multiple high-volume connected channels, performance can suffer. This is great for testing out Svelte's performance!
- Uses a fun little algorithm to collapse each username into a hue, where similar names end up with divergent colors, making them easy to tell apart.
