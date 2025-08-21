/* throttle: runs _at most_ once every specified time interval.
 *
 * Use to guarantee a regular, periodic execution of the function,
 * as long as the events that trigger the function are firing.
 *
 * Use when handling continuous events that need periodic updates,
 * like tracking scroll position or updating a resize handler.
 * */
export function throttle(callee: (...args: any[]) => void, timeout: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer) return;
    timer = setTimeout(() => {
      callee(...args);
      timer = null;
    }, timeout);
  };
}

/* debounce: runs function only after a certain period of inactivity.
 * Every time the event fires, the timer is reset; the function
 * is only called when the timer is allowed to finish (no events fire within the timeout).
 *
 * Use when handling the final state after a burst of activity has ended,
 * like autocomplete search bars that wait until the user stops typing or
 * when batching a series of events that can be rapidly fired (resize all at once).
 */
export function debounce(callee: (...args: any[]) => void, timeout: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callee(...args);
    }, timeout);
  };
}
