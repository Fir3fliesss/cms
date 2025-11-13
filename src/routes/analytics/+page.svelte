<script>
  export let data;
  $: ({ analytics, error } = data);

  // Format duration to readable format
  function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Format date to readable format
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get event badge color
  function getEventBadgeColor(eventName) {
    switch (eventName) {
      case 'page_view': return 'bg-blue-500';
      case 'scroll': return 'bg-green-500';
      case 'read_time': return 'bg-purple-500';
      case 'click': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  }
</script>

<svelte:head>
  <title>Analytics Dashboard | SynchronizeTeams</title>
  <meta name="description" content="User Behavior Analytics Dashboard for SynchronizeTeams">
  <meta name="robots" content="noindex, nofollow">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4 md:p-8">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-4xl md:text-5xl font-bold">ANALYTICS</h1>
        <a
          href="/"
          class="neo-brutal-border neo-brutal-shadow bg-white px-4 py-2 font-bold inline-flex items-center gap-2 hover:-translate-y-1 transition-all duration-300"
        >
          ← HOME
        </a>
      </div>
      <p class="text-gray-600">User Behavior Analytics Dashboard</p>
    </div>

    {#if error}
      <div class="p-6 neo-brutal-border neo-brutal-shadow bg-red-100 text-red-800 mb-8">
        <h2 class="text-2xl font-bold mb-2">Error Loading Analytics</h2>
        <p>{error}</p>
      </div>
    {/if}

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total Events -->
      <div class="neo-brutal-border neo-brutal-shadow bg-white p-6">
        <div class="text-sm font-bold text-gray-600 mb-2">TOTAL EVENTS</div>
        <div class="text-4xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
      </div>

      <!-- Page Views -->
      <div class="neo-brutal-border neo-brutal-shadow bg-blue-100 p-6">
        <div class="text-sm font-bold text-gray-600 mb-2">PAGE VIEWS</div>
        <div class="text-4xl font-bold">{analytics.pageViews.toLocaleString()}</div>
      </div>

      <!-- Unique Users -->
      <div class="neo-brutal-border neo-brutal-shadow bg-green-100 p-6">
        <div class="text-sm font-bold text-gray-600 mb-2">UNIQUE USERS</div>
        <div class="text-4xl font-bold">{analytics.uniqueUsers.toLocaleString()}</div>
      </div>

      <!-- Avg Scroll Depth -->
      <div class="neo-brutal-border neo-brutal-shadow bg-purple-100 p-6">
        <div class="text-sm font-bold text-gray-600 mb-2">AVG SCROLL DEPTH</div>
        <div class="text-4xl font-bold">{analytics.avgScrollDepth}%</div>
      </div>
    </div>

    <!-- Secondary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <!-- Avg Reading Duration -->
      <div class="neo-brutal-border neo-brutal-shadow bg-yellow-100 p-6">
        <div class="text-sm font-bold text-gray-600 mb-2">AVG READING TIME</div>
        <div class="text-3xl font-bold">{formatDuration(analytics.avgDuration)}</div>
      </div>

      <!-- Total Clicks -->
      <div class="neo-brutal-border neo-brutal-shadow bg-orange-100 p-6">
        <div class="text-sm font-bold text-gray-600 mb-2">TOTAL CLICKS</div>
        <div class="text-3xl font-bold">
          {analytics.topClicks.reduce((sum, click) => sum + click.count, 0).toLocaleString()}
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Top Pages -->
      <div class="neo-brutal-border neo-brutal-shadow bg-white p-6">
        <h2 class="text-2xl font-bold mb-4">TOP PAGES</h2>
        {#if analytics.topPages.length > 0}
          <div class="space-y-3">
            {#each analytics.topPages as page, index}
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm truncate">{page.page}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        class="bg-blue-500 h-full rounded-full"
                        style="width: {(page.count / analytics.topPages[0].count) * 100}%"
                      ></div>
                    </div>
                    <span class="text-sm font-bold">{page.count}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500">No page view data available</p>
        {/if}
      </div>

      <!-- Top Clicks -->
      <div class="neo-brutal-border neo-brutal-shadow bg-white p-6">
        <h2 class="text-2xl font-bold mb-4">TOP CLICKS</h2>
        {#if analytics.topClicks.length > 0}
          <div class="space-y-3">
            {#each analytics.topClicks as click, index}
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm truncate">{click.target}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        class="bg-orange-500 h-full rounded-full"
                        style="width: {(click.count / analytics.topClicks[0].count) * 100}%"
                      ></div>
                    </div>
                    <span class="text-sm font-bold">{click.count}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-gray-500">No click data available</p>
        {/if}
      </div>
    </div>

    <!-- Recent Events -->
    <div class="neo-brutal-border neo-brutal-shadow bg-white p-6">
      <h2 class="text-2xl font-bold mb-4">RECENT EVENTS</h2>
      {#if analytics.recentEvents.length > 0}
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-black">
                <th class="text-left py-2 px-2 font-bold">EVENT</th>
                <th class="text-left py-2 px-2 font-bold">PAGE</th>
                <th class="text-left py-2 px-2 font-bold">DETAILS</th>
                <th class="text-left py-2 px-2 font-bold">TIME</th>
              </tr>
            </thead>
            <tbody>
              {#each analytics.recentEvents.slice(0, 20) as event}
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-2 px-2">
                    <span class="inline-block px-2 py-1 text-xs font-bold text-white rounded {getEventBadgeColor(event.event_name)}">
                      {event.event_name}
                    </span>
                  </td>
                  <td class="py-2 px-2 font-mono text-xs">{event.page}</td>
                  <td class="py-2 px-2 text-xs">
                    {#if event.scroll_percent}
                      Scroll: {event.scroll_percent}%
                    {:else if event.duration}
                      Duration: {formatDuration(event.duration)}
                    {:else if event.target}
                      Target: {event.target}
                    {:else}
                      -
                    {/if}
                  </td>
                  <td class="py-2 px-2 text-xs text-gray-600">{formatDate(event.created_at)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-gray-500">No events recorded yet</p>
      {/if}
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-sm text-gray-600">
      <p>Data updated in real-time • Tracking anonymous user behavior</p>
    </div>
  </div>
</div>

<style>
  .neo-brutal-shadow {
    box-shadow: 8px 8px 0px #000;
  }

  .neo-brutal-border {
    border: 3px solid #000;
  }
</style>
