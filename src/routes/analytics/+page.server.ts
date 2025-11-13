import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);

export const load: PageServerLoad = async () => {
	try {
		// Get total events count
		const { count: totalEvents } = await supabase
			.from('events')
			.select('*', { count: 'exact', head: true });

		// Get page views count
		const { count: pageViews } = await supabase
			.from('events')
			.select('*', { count: 'exact', head: true })
			.eq('event_name', 'page_view');

		// Get top pages by views
		const { data: topPages } = await supabase
			.from('events')
			.select('page')
			.eq('event_name', 'page_view')
			.order('created_at', { ascending: false })
			.limit(1000);

		// Process top pages
		const pageViewsMap = new Map<string, number>();
		topPages?.forEach((event) => {
			const count = pageViewsMap.get(event.page) || 0;
			pageViewsMap.set(event.page, count + 1);
		});

		const topPagesData = Array.from(pageViewsMap.entries())
			.map(([page, count]) => ({ page, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		// Get average scroll depth
		const { data: scrollData } = await supabase
			.from('events')
			.select('scroll_percent')
			.eq('event_name', 'scroll')
			.not('scroll_percent', 'is', null);

		const avgScrollDepth =
			scrollData && scrollData.length > 0
				? Math.round(
						scrollData.reduce((sum, event) => sum + (event.scroll_percent || 0), 0) /
							scrollData.length
					)
				: 0;

		// Get average reading duration
		const { data: durationData } = await supabase
			.from('events')
			.select('duration')
			.eq('event_name', 'read_time')
			.not('duration', 'is', null);

		const avgDuration =
			durationData && durationData.length > 0
				? Math.round(
						durationData.reduce((sum, event) => sum + (event.duration || 0), 0) /
							durationData.length
					)
				: 0;

		// Get click events
		const { data: clickData } = await supabase
			.from('events')
			.select('target')
			.eq('event_name', 'click')
			.not('target', 'is', null);

		// Process click data
		const clicksMap = new Map<string, number>();
		clickData?.forEach((event) => {
			const count = clicksMap.get(event.target!) || 0;
			clicksMap.set(event.target!, count + 1);
		});

		const topClicks = Array.from(clicksMap.entries())
			.map(([target, count]) => ({ target, count }))
			.sort((a, b) => b.count - a.count);

		// Get unique users count
		const { data: uniqueUsersData } = await supabase
			.from('events')
			.select('user_id')
			.order('created_at', { ascending: false });

		const uniqueUsers = new Set(uniqueUsersData?.map((event) => event.user_id)).size;

		// Get recent events
		const { data: recentEvents } = await supabase
			.from('events')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(50);

		return {
			analytics: {
				totalEvents: totalEvents || 0,
				pageViews: pageViews || 0,
				uniqueUsers,
				topPages: topPagesData,
				avgScrollDepth,
				avgDuration,
				topClicks,
				recentEvents: recentEvents || []
			}
		};
	} catch (error) {
		console.error('Failed to fetch analytics:', error);
		return {
			analytics: {
				totalEvents: 0,
				pageViews: 0,
				uniqueUsers: 0,
				topPages: [],
				avgScrollDepth: 0,
				avgDuration: 0,
				topClicks: [],
				recentEvents: []
			},
			error: 'Failed to load analytics data'
		};
	}
};
