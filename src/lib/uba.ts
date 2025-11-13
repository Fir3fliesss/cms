/**
 * User Behavior Analytics (UBA) Module
 * Lightweight and non-intrusive analytics for tracking user behavior
 */

import { browser } from '$app/environment';

// Event types
export type EventName = 'page_view' | 'scroll' | 'read_time' | 'click';

export interface UBAEvent {
	event_name: EventName;
	page: string;
	user_id: string;
	scroll_percent?: number;
	duration?: number;
	target?: string;
}

// Constants
const STORAGE_KEY = 'uba_user_id';
const API_ENDPOINT = '/api/uba';
const SCROLL_DEBOUNCE_MS = 200;
const DURATION_INTERVAL_MS = 1000;

/**
 * Generate or retrieve anonymous user ID from localStorage
 */
export function getUserId(): string {
	if (!browser) return '';

	let userId = localStorage.getItem(STORAGE_KEY);

	if (!userId) {
		userId = crypto.randomUUID();
		localStorage.setItem(STORAGE_KEY, userId);
	}

	return userId;
}

/**
 * Send event to UBA API endpoint
 */
export async function sendEvent(
	eventName: EventName,
	data: Partial<UBAEvent> = {}
): Promise<void> {
	if (!browser) return;

	try {
		const event: UBAEvent = {
			event_name: eventName,
			page: data.page || window.location.pathname,
			user_id: getUserId(),
			...data
		};

		// Send to API endpoint (fire and forget)
		fetch(API_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(event),
			// Don't block user interaction
			keepalive: true
		}).catch(() => {
			// Silently fail - don't impact user experience
		});
	} catch (error) {
		// Silently fail - analytics should never break the app
		console.debug('UBA: Failed to send event', error);
	}
}

/**
 * Track scroll depth on the current page
 * Sends event when scroll percentage increases
 */
export function trackScrollDepth(): () => void {
	if (!browser) return () => {};

	let maxScrollPercent = 0;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const handleScroll = () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			const scrollPercent = Math.round(
				((scrollTop + windowHeight) / documentHeight) * 100
			);

			// Only send if scroll depth increased by at least 10%
			if (scrollPercent > maxScrollPercent && scrollPercent - maxScrollPercent >= 10) {
				maxScrollPercent = scrollPercent;
				sendEvent('scroll', {
					scroll_percent: Math.min(scrollPercent, 100)
				});
			}
		}, SCROLL_DEBOUNCE_MS);
	};

	window.addEventListener('scroll', handleScroll, { passive: true });

	// Cleanup function
	return () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		window.removeEventListener('scroll', handleScroll);
	};
}

/**
 * Track reading duration on the current page
 * Sends event when user leaves the page
 */
export function trackReadingDuration(): () => void {
	if (!browser) return () => {};

	let startTime = Date.now();
	let duration = 0;
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Update duration every second
	intervalId = setInterval(() => {
		duration = Math.floor((Date.now() - startTime) / 1000);
	}, DURATION_INTERVAL_MS);

	// Send event when user leaves
	const handleBeforeUnload = () => {
		const finalDuration = Math.floor((Date.now() - startTime) / 1000);

		// Only send if duration > 0
		if (finalDuration > 0) {
			sendEvent('read_time', {
				duration: finalDuration
			});
		}
	};

	// Use both events to catch all exit scenarios
	window.addEventListener('beforeunload', handleBeforeUnload);
	window.addEventListener('pagehide', handleBeforeUnload);

	// Cleanup function
	return () => {
		if (intervalId) {
			clearInterval(intervalId);
		}
		window.removeEventListener('beforeunload', handleBeforeUnload);
		window.removeEventListener('pagehide', handleBeforeUnload);

		// Send final duration on cleanup
		const finalDuration = Math.floor((Date.now() - startTime) / 1000);
		if (finalDuration > 0) {
			sendEvent('read_time', {
				duration: finalDuration
			});
		}
	};
}

/**
 * Track click on a specific element/CTA
 */
export function trackClick(target: string, additionalData: Partial<UBAEvent> = {}): void {
	sendEvent('click', {
		target,
		...additionalData
	});
}

/**
 * Initialize UBA tracking on page load
 * Call this once per page to enable all tracking
 */
export function initUBA(options: { trackScroll?: boolean; trackDuration?: boolean } = {}) {
	if (!browser) return () => {};

	const { trackScroll = true, trackDuration = true } = options;
	const cleanupFns: Array<() => void> = [];

	// Track page view on init
	sendEvent('page_view');

	// Setup scroll tracking
	if (trackScroll) {
		const cleanupScroll = trackScrollDepth();
		cleanupFns.push(cleanupScroll);
	}

	// Setup duration tracking
	if (trackDuration) {
		const cleanupDuration = trackReadingDuration();
		cleanupFns.push(cleanupDuration);
	}

	// Return cleanup function
	return () => {
		cleanupFns.forEach(fn => fn());
	};
}
