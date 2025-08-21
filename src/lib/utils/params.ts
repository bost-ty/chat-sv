/**
 * Load and connect to channels from URL
 * https://example.com/?channels=MyChannelName,YourChannelName
 */
export const getChannelsFromQueryParams = (href: string) => {
  const url = new URL(href);
  const channelState = url.searchParams.get("channels");
  return channelState;
};
