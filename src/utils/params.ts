/**
 * Load and connect to channels from URL
 * https://example.com/?channels=MyChannelName,YourChannelName
 */
export const getChannelsFromQueryParams = (href: string): string => {
	const url = new URL(window.location.href);
	const channelState = url.searchParams.get("channels");
	return channelState;
}
