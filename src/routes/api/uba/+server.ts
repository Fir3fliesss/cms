import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } from '$env/static/private';

// Create server-side Supabase client
const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);

/**
 * POST /api/uba
 * Receives UBA events and stores them in Supabase
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const event = await request.json();

		// Validate required fields
		if (!event.event_name || !event.page || !event.user_id) {
			return json(
				{
					success: false,
					error: 'Missing required fields: event_name, page, user_id'
				},
				{ status: 400 }
			);
		}

		// Validate event_name
		const validEventNames = ['page_view', 'scroll', 'read_time', 'click'];
		if (!validEventNames.includes(event.event_name)) {
			return json(
				{
					success: false,
					error: 'Invalid event_name'
				},
				{ status: 400 }
			);
		}

		// Prepare data for insertion
		const eventData = {
			event_name: event.event_name,
			page: event.page,
			user_id: event.user_id,
			scroll_percent: event.scroll_percent || null,
			duration: event.duration || null,
			target: event.target || null
		};

		// Insert into Supabase
		const { error } = await supabase.from('events').insert(eventData);

		if (error) {
			console.error('UBA API: Supabase insert error', error);
			return json(
				{
					success: false,
					error: 'Failed to store event'
				},
				{ status: 500 }
			);
		}

		return json({
			success: true
		});
	} catch (error) {
		console.error('UBA API: Unexpected error', error);
		return json(
			{
				success: false,
				error: 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
