<script>
  export let data;
  $: ({ discussion, error } = data);

  // Memoize expensive computations
  $: formattedDate = discussion?.createdAt
    ? new Date(discussion.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Tanggal tidak tersedia';

  let avatarError = false;
  function handleAvatarError() {
    avatarError = true;
  }

  // Share functionality
  function shareArticle() {
    if (navigator.share && discussion) {
      const shareText = `📖 *${discussion.title}*\n\nby ${discussion.author?.login || 'Anonymous'}\n\n🔗 Baca selengkapnya di SynchronizeTeams:\n${window.location.href}`;
      
      navigator.share({
        title: discussion.title || 'Article by SynchronizeTeams',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard with formatted text
      const shareText = `📖 *${discussion.title}*\n\nby ${discussion.author?.login || 'Anonymous'}\n\n🔗 Baca selengkapnya di SynchronizeTeams:\n${window.location.href}`;
      
      navigator.clipboard.writeText(shareText).then(() => {
        alert('✅ Artikel berhasil disalin!\n\nSilakan bagikan ke platform favorit Anda.');
      }).catch(err => console.error('Failed to copy:', err));
    }
  }

  // Generate SEO-friendly URL - only on client side
  $: currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Extract first image from content for SEO - memoized
  $: firstImage = discussion?.bodyHTML ? 
    (() => {
      // Cache the regex result
      if (!discussion.bodyHTML) return null;
      const imgMatch = discussion.bodyHTML.match(/<img[^>]+src="([^"]+)"/);
      return imgMatch ? imgMatch[1] : null;
    })() : null;

  // Preload critical CSS
  $: criticalStyles = `
    .neo-brutal-shadow { box-shadow: 8px 8px 0px #000; }
    .neo-brutal-border { border: 3px solid #000; }
  `;
</script>

<svelte:head>
  <!-- Critical CSS for faster rendering -->
  <style>
    .neo-brutal-shadow { box-shadow: 8px 8px 0px #000; }
    .neo-brutal-border { border: 3px solid #000; }
  </style>
  
  <!-- Preload critical resources -->
  <link rel="preload" href="favicon.png" as="image" type="image/png">
  
  <!-- DNS prefetch and preconnect for performance -->
  <link rel="dns-prefetch" href="//drive.usercontent.google.com">
  <link rel="preconnect" href="https://drive.usercontent.google.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  
  <title>{discussion?.title || 'Article'} | SynchronizeTeams</title>

  <!-- Basic SEO Meta Tags -->
  <meta name="description" content={discussion?.bodyText?.substring(0, 160) || `Read "${discussion?.title || 'this article'}" by ${discussion?.author?.login || 'Anonymous'} on SynchronizeTeams. Sync in Tech just with Us.`}>
  <meta name="keywords" content="SynchronizeTeams, Sync in Tech, {discussion?.title || 'Articles'}, {discussion?.author?.login || 'Tech'}, Technology, Programming">
  <meta name="author" content={discussion?.author?.login || 'SynchronizeTeams'}>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">

  <!-- Cache control headers -->
  <meta http-equiv="Cache-Control" content="public, max-age=31536000">
  <meta http-equiv="Expires" content={new Date(Date.now() + 31536000000).toUTCString()}>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content={currentUrl}>
  <meta property="og:title" content={discussion?.title || 'Article | SynchronizeTeams'}>
  <meta property="og:description" content={discussion?.bodyText?.substring(0, 160) || `Read "${discussion?.title || 'this article'}" by ${discussion?.author?.login || 'Anonymous'} on SynchronizeTeams.`}>
  <meta property="og:image" content={firstImage || 'https://drive.usercontent.google.com/download?id=1mNq-7QcdnKZBYAp0f6IAlNjJU9QyMVxr&export=view&authuser=0'}>
  <meta property="og:site_name" content="SynchronizeTeams">
  <meta property="article:author" content={discussion?.author?.login || 'SynchronizeTeams'}>
  <meta property="article:published_time" content={discussion?.createdAt}>

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content={currentUrl}>
  <meta property="twitter:title" content={discussion?.title || 'Article | SynchronizeTeams'}>
  <meta property="twitter:description" content={discussion?.bodyText?.substring(0, 160) || `Read "${discussion?.title || 'this article'}" by ${discussion?.author?.login || 'Anonymous'} on SynchronizeTeams.`}>
  <meta property="twitter:image" content={firstImage || 'https://drive.usercontent.google.com/download?id=1mNq-7QcdnKZBYAp0f6IAlNjJU9QyMVxr&export=view&authuser=0'}>

  <!-- Canonical URL -->
  <link rel="canonical" href={currentUrl}>

  <!-- Favicon -->
  <link rel="shortcut icon" href="favicon.png" type="image/x-icon">
  <link rel="icon" href="favicon.png" type="image/png">
  
  <!-- Service Worker for caching (if available) -->
  {#if typeof window !== 'undefined' && 'serviceWorker' in navigator}
    <script>
      // Register service worker for caching
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
        });
      }
    </script>
  {/if}

  <!-- Structured Data for SEO - only render if we have discussion data -->
  {#if discussion}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": discussion?.title || "Article",
        "description": discussion?.bodyText?.substring(0, 160) || `Read "${discussion?.title || 'this article'}" by ${discussion?.author?.login || 'Anonymous'} on SynchronizeTeams.`,
        "image": firstImage || 'https://drive.usercontent.google.com/download?id=1mNq-7QcdnKZBYAp0f6IAlNjJU9QyMVxr&export=view&authuser=0',
        "author": {
          "@type": "Person",
          "name": discussion?.author?.login || "Anonymous"
        },
        "publisher": {
          "@type": "Organization",
          "name": "SynchronizeTeams",
          "logo": {
            "@type": "ImageObject",
            "url": "favicon.png"
          }
        },
        "datePublished": discussion?.createdAt,
        "dateModified": discussion?.createdAt,
        "mainEntityOfPage": currentUrl
      })}
    </script>
  {/if}
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <!-- Breadcrumb -->
    <nav class="mb-6" aria-label="Breadcrumb navigation">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <a href="/" class="text-gray-600 hover:text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">Home</a>
        </li>
        <li class="text-gray-400" aria-hidden="true">/</li>
        <li>
          <a href="/" class="text-gray-600 hover:text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">Articles</a>
        </li>
        <li class="text-gray-400" aria-hidden="true">/</li>
        <li>
          <span class="text-black font-medium" aria-current="page">{discussion?.title || 'Article'}</span>
        </li>
      </ol>
    </nav>

    <!-- Back Button -->
    <div class="mb-6">
      <a
        href="/"
        class="neo-brutal-border neo-brutal-shadow bg-white px-4 py-2 font-bold inline-flex items-center gap-2 hover:-translate-y-1 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
        aria-label="Kembali ke halaman artikel"
      >
        <span class="text-xl group-hover:-translate-x-1 transition-transform duration-300" aria-hidden="true">←</span>
        BACK TO ARTICLES
      </a>
    </div>

    {#if error}
      <div class="p-6 neo-brutal-border neo-brutal-shadow bg-red-100 text-red-800 mb-8 relative overflow-hidden">
        <div class="absolute top-2 right-2 w-8 h-8 bg-red-300 rounded-full opacity-30"></div>
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-2">Error Loading Article</h2>
          <p>{error}</p>
        </div>
      </div>
    {/if}

    <div class="neo-brutal-border neo-brutal-shadow bg-white p-6 md:p-8 mb-8 relative overflow-hidden">
      <!-- Minimal decorative element -->
      <div class="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full -mr-12 -mt-12 opacity-30"></div>

      <div class="relative z-10">
        <!-- Article number badge -->
        {#if discussion?.number}
          <div class="inline-block bg-black text-white px-3 py-1 font-bold neo-brutal-border mb-4">
            ARTICLE #{discussion.number}
          </div>
        {/if}

        <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight" id="article-title">
          {discussion?.title?.toUpperCase() || 'No Title Available'}
        </h1>

        <div class="flex items-center gap-4 mb-8 bg-gray-50 p-4 neo-brutal-border">
          <div class="w-12 h-12 neo-brutal-border rounded-full overflow-hidden bg-white p-1">
            {#if discussion?.author && discussion.author.avatarUrl && !avatarError}
              <img
                loading="lazy"
                src={discussion.author.avatarUrl}
                alt={discussion.author.login}
                class="w-full h-full object-cover rounded-full"
                on:error={handleAvatarError}
              >
            {:else}
              <div class="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-lg">?</span>
              </div>
            {/if}
          </div>
          <div>
            <p class="font-bold">{discussion?.author?.login || 'Anonymous'}</p>
            <p class="text-sm text-gray-600">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="neo-brutal-border neo-brutal-shadow bg-white p-6 md:p-8 mb-8">
      <div class="space-y-6 text-lg">
        <div class="discussion-content neo-brutal-border p-6" role="article" aria-labelledby="article-title">
          {@html discussion?.bodyHTML || '<p>No content available</p>'}
        </div>
        
        <!-- Add loading indicator for images -->
        {#if typeof window !== 'undefined'}
          <script>
            // Optimize images after content loads
            setTimeout(() => {
              const images = document.querySelectorAll('.discussion-content img');
              images.forEach(img => {
                // Add loading="lazy" if not already set
                if (!img.loading) {
                  img.loading = 'lazy';
                }
                
                // Add proper alt text if missing
                if (!img.alt || img.alt.trim() === '') {
                  img.alt = 'Image from article content';
                }
                
                // Add error handling with fallback
                img.onerror = function() {
                  this.style.display = 'none';
                  // Add placeholder for broken images
                  const placeholder = document.createElement('div');
                  placeholder.className = 'neo-brutal-border bg-gray-200 p-4 text-center text-gray-500';
                  placeholder.textContent = 'Image not available';
                  placeholder.style.width = this.style.width || '100%';
                  placeholder.style.height = this.style.height || '200px';
                  this.parentNode.insertBefore(placeholder, this);
                };
                
                // Optimize image loading with intersection observer
                if ('IntersectionObserver' in window) {
                  const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Add loading state
                        img.classList.add('loading');
                        
                        // Load image
                        if (img.dataset.src) {
                          img.src = img.dataset.src;
                          img.removeAttribute('data-src');
                        }
                        
                        // Handle load complete
                        img.onload = function() {
                          img.classList.remove('loading');
                          img.classList.add('loaded');
                        };
                        
                        observer.unobserve(img);
                      }
                    });
                  }, {
                    rootMargin: '50px 0px', // Start loading 50px before entering viewport
                    threshold: 0.01
                  });
                  
                  if (img.dataset.src) {
                    imageObserver.observe(img);
                  }
                }
              });
            }, 100);
          </script>
        {/if}
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between items-center mb-8">
      <a
        href="/"
        class="neo-brutal-border neo-brutal-shadow bg-blue-300 px-4 py-2 font-bold text-gray-900 hover:bg-blue-400 transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-label="Kembali ke daftar artikel"
      >
        <span class="group-hover:-translate-x-1 transition-transform duration-300" aria-hidden="true">←</span>
        BACK
      </a>

      <div class="flex gap-2" aria-hidden="true">
        <div class="w-3 h-3 bg-black rounded-full"></div>
        <div class="w-3 h-3 bg-blue-400 rounded-full"></div>
        <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
      </div>

      <button
        on:click={shareArticle}
        class="neo-brutal-border neo-brutal-shadow bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800 transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
        aria-label="Bagikan artikel ini"
      >
        SHARE
        <span class="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
      </button>
    </div>

    <!-- Footer -->
    <div class="neo-brutal-border neo-brutal-shadow bg-gray-900 text-white p-6 text-center relative overflow-hidden">
      <div class="absolute top-2 right-2 w-8 h-8 bg-blue-400 rounded-full opacity-30"></div>
      <div class="absolute bottom-2 left-2 w-6 h-6 bg-gray-400 rounded-full opacity-30"></div>

      <div class="relative z-10">
        <div class="flex justify-center gap-2 mb-4">
          <div class="w-2 h-2 bg-white rounded-full"></div>
          <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
        <p class="font-bold">© 2025 SynchronizeTeams. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>

<style>
  /* Critical styles moved to head for faster rendering */
  
  /* Optimize animations */
  * {
    will-change: auto;
  }
  
  .group:hover * {
    will-change: transform;
  }

  /* Reduce repaints and reflows */
  .neo-brutal-shadow {
    box-shadow: 8px 8px 0px #000;
    transform: translateZ(0); /* Hardware acceleration */
  }

  .neo-brutal-border {
    border: 3px solid #000;
  }

  /* Optimize content styling */
  :global(.discussion-content) {
    contain: layout style paint; /* Performance optimization */
  }

  :global(.discussion-content em) {
    font-style: italic !important;
  }

  :global(.discussion-content strong) {
    font-weight: bold !important;
  }

  :global(.discussion-content ul),
  :global(.discussion-content ol) {
    padding-left: 1.5rem !important;
    margin-bottom: 1rem !important;
    list-style-position: outside !important;
  }

  :global(.discussion-content ul) {
    list-style-type: disc !important;
  }

  :global(.discussion-content ol) {
    list-style-type: decimal !important;
  }

  :global(.discussion-content li) {
    margin-bottom: 0.5rem !important;
    display: list-item !important;
  }

  :global(.discussion-content blockquote) {
    border-left: 4px solid #ccc !important;
    padding-left: 1rem !important;
    color: #555 !important;
    margin: 1rem 0 !important;
    font-style: italic !important;
  }

  :global(.discussion-content code) {
    background-color: #F3F4F6 !important; /* Light gray - better contrast */
    color: #1F2937 !important; /* Dark text - better contrast */
    padding: 0.3rem 0.6rem !important;
    border-radius: 4px !important;
    font-family: 'Courier New', monospace !important;
    font-weight: 600 !important;
    border: 1px solid #D1D5DB !important;
  }

  :global(.discussion-content code:focus) {
    outline: 2px solid #4F46E5 !important; /* Indigo focus for accessibility */
    outline-offset: 2px !important;
  }

  :global(.discussion-content a) {
    color: #000000 !important;
    text-decoration: none !important;
    background-color: #FEF3C7 !important; /* Light yellow - better contrast */
    padding: 0.3rem 0.6rem !important;
    font-weight: 700 !important;
    border: 2px solid #000000 !important;
    transition: transform 0.2s ease, background-color 0.2s ease !important;
    display: inline-block !important;
    border-radius: 4px !important;
    transform: translateZ(0); /* Hardware acceleration */
  }

  :global(.discussion-content a:hover) {
    background-color: #FED7AA !important; /* Darker yellow for hover */
    transform: rotate(-1deg) translateZ(0) !important;
    box-shadow: 4px 4px 0px #000000 !important;
  }

  :global(.discussion-content a:focus) {
    outline: 3px solid #4F46E5 !important; /* Indigo focus for accessibility */
    outline-offset: 2px !important;
  }

  :global(.discussion-content img) {
    max-width: 100% !important;
    height: auto !important;
    margin: 1rem 0 !important;
    contain: layout; /* Performance optimization */
    content-visibility: auto; /* Improve performance for offscreen images */
    will-change: auto; /* Optimize for animations */
  }

  /* Image loading states */
  :global(.discussion-content img[loading]) {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  :global(.discussion-content img.loaded) {
    animation: none;
    background: none;
  }
</style>
