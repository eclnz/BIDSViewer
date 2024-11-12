<template>
  <header class="bg-sky-900 p-4">
    <nav class="flex items-center justify-between">
      <div class="flex items-center">
        <img :src="logo" alt="BIDSViewer Logo" class="h-10 w-auto mr-3">
      </div>
    </nav>
  </header>
</template>

<script>
import logo from '@/assets/HeaderLogoInv.png';

export default {
  name: 'AppHeader',
  data() {
    return {
      logo,
    };
  },
};
</script>