<template>
  <!-- Centered Pagination Box (only visible if more than one pages) -->
  <div class="flex justify-center mb-4" v-if="totalPages > 1">
    <div class="flex rounded-lg border border-gray-200 shadow-sm overflow-hidden">

      <!-- Previous Page Button -->
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1" 
        class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
        aria-label="Previous Page"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          class="w-5 h-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Current Page -->
      <span class="px-4 py-2 bg-white">Page {{ currentPage }} of {{ totalPages }}</span>

      <!-- Next Page Button TODO: Make these both one component --> 
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages" 
        class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
        aria-label="Next Page"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          class="w-5 h-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginationControls',
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  emits: ['next-page', 'prev-page'],
  methods: {
    nextPage() {
      this.$emit('next-page');
      this.scrollToTop();
    },
    prevPage() {
      this.$emit('prev-page');
      this.scrollToTop();
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  },
};
</script>