import type { HandleClientError } from '@sveltejs/kit';
import { sendEvent } from '$lib/uba';

/**
 * Client-side hooks
 * Tracks page views on every navigation
 */

// Track page view on initial load and navigation
if (typeof window !== 'undefined') {
	// Track initial page view
	sendEvent('page_view');

	// Track subsequent navigations using SvelteKit's navigation events
	// This will be triggered on client-side navigation
	let previousPath = window.location.pathname;

	// Use setInterval to detect URL changes (fallback for client-side routing)
	setInterval(() => {
		const currentPath = window.location.pathname;
		if (currentPath !== previousPath) {
			previousPath = currentPath;
			sendEvent('page_view', { page: currentPath });
		}
	}, 100);
}

/**
 * Handle client-side errors
 * Optional: track errors as events
 */
export const handleError: HandleClientError = async ({ error, event }) => {
	// You can track errors here if needed
	// sendEvent('error', { page: event.url.pathname, target: error.message });

	console.error('Client error:', error);

	return {
		message: 'An unexpected error occurred'
	};
};
