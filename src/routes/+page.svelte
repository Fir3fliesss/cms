<script>
  export let data;
  $: ({ nodes } = data);
</script>

<svelte:head>
  <title>Articles - SynchronizeTeams</title>
  <meta name="description" content="Read the latest articles about SynchronizeTeams. Sync in Tech just with Us.">
  <meta name="keywords" content="SynchronizeTeams, Sync in Tech, Articles">
  <meta name="author" content="SynchronizeTeams">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <meta name="image" content="https://drive.usercontent.google.com/download?id=1mNq-7QcdnKZBYAp0f6IAlNjJU9QyMVxr&export=view&authuser=0">
  <link rel="shortcut icon" href="favicon.png" type="image/x-icon">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <!-- Breadcrumb -->
    <div class="mb-6">
      <nav class="flex items-center space-x-2 text-sm">
        <a href="/" class="text-gray-600 hover:text-black font-medium">Home</a>
        <span class="text-gray-400">/</span>
        <span class="text-black font-medium">Articles</span>
      </nav>
    </div>

    <div class="neo-brutal-border neo-brutal-shadow bg-white p-6 md:p-8 mb-8 relative overflow-hidden">
      <!-- Minimal decorative element -->
      <div class="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
      
      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight border-b-4 border-black pb-4">
          LATEST ARTICLES
        </h1>
        <p class="text-lg text-gray-600">Sync in Tech just with Us</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each nodes as { title, number, slug, createdAt }}
        <div class="neo-brutal-border neo-brutal-shadow bg-white p-6 hover:-translate-y-1 transition-transform relative overflow-hidden">
          <!-- Minimal decorative element -->
          <div class="absolute top-2 right-2 w-4 h-4 bg-blue-300 rounded-full opacity-50"></div>
          
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-4">
              <span class="text-sm text-gray-600">
                {new Date(createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span class="bg-black text-white px-2 py-1 text-sm">#{number}</span>
            </div>

            <h2 class="text-2xl font-bold mb-4 leading-tight">{title}</h2>

            <a
              href="/article/{slug}-{number}"
              class="neo-brutal-border neo-brutal-shadow bg-blue-300 px-4 py-2 font-bold inline-flex items-center gap-2 hover:bg-blue-400 transition-all duration-300 group"
            >
              Read More 
              <span class="text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
        </div>
      {/each}
    </div>

    <!-- Footer -->
    <div class="mt-12 neo-brutal-border neo-brutal-shadow bg-gray-900 text-white p-6 text-center">
      <div class="flex justify-center gap-2 mb-4">
        <div class="w-2 h-2 bg-white rounded-full"></div>
        <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
        <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
      <p class="font-bold">© 2025 SynchronizeTeams. All rights reserved.</p>
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
