<script>
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_#000]">
  <h1 class="text-7xl font-extrabold text-black">404</h1>
  <p class="text-2xl text-black mt-4">Halaman Tidak Ditemukan</p>
  <p class="text-lg text-black mt-2">Maaf, halaman yang Anda cari tidak ada.</p>
  <button
    on:click={() => goto('/')}
    class="mt-8 px-8 py-4 bg-black text-white border-4 border-black shadow-[6px_6px_0_0_#000] hover:bg-yellow-400 hover:text-black transition-all duration-200"
  >
    Kembali ke Beranda
  </button>
</div>

<style>
  /* Anda bisa menambahkan gaya kustom di sini jika diperlukan */
</style>
