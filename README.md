# chat-sv

A simple frontend for reading Twitch chat. Built with Svelte 5.

## Features

- Runs entirely in the browser
- Connects to Twitch anonymously
- Provides a customizable "chats per X minutes" display
- Uses a fun lil' function to collapse each username into a hue such that similar names end up with divergent colors, making them easy to tell apart even if they're spelled very similarly.
- A Twitch-like "pause on hover" for reading chat more easily
- Does not implement virtualization/virtual lists/windowed rendering, so with multiple high-volume connected channels, performance can suffer. (This is great for testing out Svelte's performance!)
