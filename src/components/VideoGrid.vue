<template>
  <div class="rounded-lg p-4">
    <!-- Pagination Controls at the top -->
    <PaginationControls 
      :currentPage="currentPage" 
      :totalPages="totalPages" 
      @next-page="nextPage" 
      @prev-page="prevPage" 
    />

    <!-- Video display grouped by subject or subject-session with pagination -->
    <div v-for="({ groupKey, videos }) in paginatedVideos[currentPage - 1]" :key="groupKey" class="mb-4 bg-white p-3 rounded-lg shadow">
      
      <!-- Subject Name / Subject-Session Name -->
      <h3 class="text-xl font-black text-sky-900 mb-2 text-center">{{ groupKey }}</h3>
      
      <!-- Media Container -->
      <div class="flex flex-wrap gap-8 justify-center">
        <div v-for="(video, index) in videos" :key="index" class="max-w-sm sm:w-1/2 lg:w-1/3">

          <!-- Session Name (if grouping by subject) -->
          <h4 v-if="fileStore.groupBy === 'subject'" class="text-base font-medium text-gray-700 text-center">{{ video.session }}</h4>
          
          <!-- Media -->
          <video
            v-if="video.fileName && video.fileName.endsWith('.mp4')"
            :src="video.path"
            class="w-full rounded-md"
            controls
            autoplay
            loop
            muted
          ></video>
          <img
            v-else-if="video.fileName && (video.fileName.endsWith('.jpeg') || video.fileName.endsWith('.png'))"
            :src="video.path"
            alt="Image"
            class="w-full rounded-md"
          />
          <!-- File Name -->
          <p class="text-sm italic font-light text-gray-500 text-center">{{ video.fileName }}</p>
        </div>

        <!-- Quality Control Component (visible only if QC is enabled) -->
        <div 
        v-if="qcStore.qualityControlEnabled 
          && qcStore.qcData.length > 0 
          && qcStore.selectedQCVariables.some(variable => variable.name && variable.type)"
        >
          <ScanQualityControlEntry :groupKey="groupKey" />
        </div>
      </div>
    </div>

    <!-- Pagination Controls at the bottom -->
    <PaginationControls 
      :currentPage="currentPage" 
      :totalPages="totalPages" 
      @next-page="nextPage" 
      @prev-page="prevPage" 
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useFileStore } from '@/stores/useFileStore';
import { useQCStore } from '@/stores/useQCStore';
import PaginationControls from './PaginationControls.vue';
import ScanQualityControlEntry from './ScanQualityControlEntry.vue';

export default {
  name: 'VideoGrid',
  components: {
    PaginationControls,
    ScanQualityControlEntry,
  },
  setup() {
    const fileStore = useFileStore();
    const qcStore = useQCStore();
    const currentPage = ref(1);
    const videosPerPage = 30;

    const paginatedVideos = computed(() => {
      const groupedVideos = Object.entries(fileStore.groupedVideos);
      const pages = [];
      let currentGroup = [];
      let currentCount = 0;

      groupedVideos.forEach(([groupKey, videos]) => {
        if (currentCount + videos.length > videosPerPage && currentGroup.length > 0) {
          pages.push(currentGroup);
          currentGroup = [];
          currentCount = 0;
        }
        currentGroup.push({ groupKey, videos });
        currentCount += videos.length;
      });

      if (currentGroup.length > 0) {
        pages.push(currentGroup);
      }

      return pages;
    });

    const totalPages = computed(() => paginatedVideos.value.length);

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
      resetVideos();
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
      resetVideos();
    };

    const resetVideos = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        video.load();
      });
    };

    watch(
      () => fileStore.selectedFileNames,
      () => {
        currentPage.value = 1;
        resetVideos();
      }
    );

    return {
      fileStore,
      qcStore,
      currentPage,
      totalPages,
      paginatedVideos,
      nextPage,
      prevPage,
    };
  },
};
</script>