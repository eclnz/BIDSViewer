<template>
  <div id="app" class="flex h-screen">
    <!-- Main Content Area with Scrollable VideoGrid -->
    <div ref="contentContainer" class="flex-grow h-screen overflow-y-auto">
      <AppHeader />
      <VideoGrid 
        v-if="Object.keys(fileStore.groupedVideos).length > 0" 
        :groupBy="fileStore.groupBy" 
      />
    </div>

    <!-- Sidebar Container on the right -->
    <div :class="['transition-width duration-300', isCollapsed ? 'w-0' : 'w-90', 'bg-gray-100 relative border-l border-gray-300']">
      <!-- Toggle Button - Hamburger for collapsed and minimize arrow for expanded -->
      <button 
        @click="toggleSidebar"
        class="absolute top-9 -translate-y-1/2 right-[calc(100%+1rem)] bg-red-500 text-slate-100 rounded-lg p-2 flex items-center justify-center shadow-sm"
      >
        <!-- Hamburger icon for collapsed state -->
        <svg 
          v-if="isCollapsed"
          xmlns="http://www.w3.org/2000/svg"
          class="w-7 h-7"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
        
        <!-- Arrow icon for expanded state -->
        <!-- Arrow icon pointing right for expanded state -->
        <!-- Arrow icon pointing right for expanded state -->
        <svg 
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-7 h-7 transition-transform duration-200"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6l6 6-6 6" />
        </svg>
      </button>

      <!-- Sidebar Content with scrollable overflow -->
      <div v-show="!isCollapsed" class="p-4 space-y-4 h-full overflow-y-auto flex flex-col justify-between">
        <!-- Top part of sidebar -->
        <div>
          <h2 class="text-2xl font-semibold text-center text-gray-700 mb-1">Settings</h2>
          <BIDSSelector />
          <div v-if="Object.keys(fileStore.videosMap).length > 0" class="my-4">
            <VideoSelect :fileNames="fileStore.getAllUniqueFileNames" />
            <RowSelect @group-by-selected="handleGroupBySelection" class="mt-4" />
            <QualityControl class="mt-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useFileStore } from '@/stores/useFileStore';
import AppHeader from './components/AppHeader.vue';
import BIDSSelector from './components/BIDSSelector.vue';
import VideoSelect from './components/VideoSelect.vue';
import RowSelect from './components/RowSelect.vue';
import VideoGrid from './components/VideoGrid.vue';
import QualityControl from './components/QualityControl.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    BIDSSelector,
    VideoSelect,
    RowSelect,
    VideoGrid,
    QualityControl,
  },
  setup() {
    const fileStore = useFileStore();
    const isCollapsed = ref(false);

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const handleGroupBySelection = (groupBy) => {
      fileStore.updateGroupBy(groupBy);
    };

    return {
      fileStore,
      isCollapsed,
      toggleSidebar,
      handleGroupBySelection,
    };
  },
};
</script>

<style>
* {
  font-family: 'Lato', sans-serif;
}
</style>