# chat-sv

A simple frontend for reading Twitch chat, built with Svelte 5.

## Features

- Runs entirely in the browser
- Connects to Twitch anonymously
- Customizable chat rate display
- Converts each chatter's username into a unique color, making them easy to tell apart even if the usernames are very similar
- Chat scrolling pauses on hover for easy reading and scrollback
- Custom virtual list implementation for rendering thousands and thousands of chat messages without any lag, even during window or chat pane resizing
