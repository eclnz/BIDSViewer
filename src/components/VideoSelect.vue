<template>
  <div class="p-3 bg-white rounded-lg border border-gray-200 shadow-md max-w-lg">
    <h2 class="text-lg ml-1 font-semibold text-gray-700 mb-1">Select Media</h2>
    
    <details class="w-full">
      <!-- All Media in Summary -->
      <summary class="cursor-pointer text-blue-700 underline hover:text-blue-500 mb-2">Media List (click to expand)</summary>
      
      <div v-if="fileNames.length" class="space-y-1 mr-1 mt-2">
        <!-- All Media -->
        <label 
          v-for="(fileName, index) in fileNames" 
          :key="index" 
          class="flex items-center justify-between hover:bg-gray-100 rounded-md w-full"
        >
          <!-- Media Name -->
          <span class="text-gray-700 truncate ml-2 max-w-[calc(100%-2rem)]">{{ fileName }}</span>
          
          <!-- Media Checkbox -->
          <input 
            type="checkbox" 
            :checked="isSelected(fileName)" 
            @change="toggleSelection(fileName)" 
            class="h-5 w-5 text-blue-900"
          />
        </label>
        
      </div>
    </details>
  </div>
</template>

<script>
import { useFileStore } from '@/stores/useFileStore';

export default {
  name: 'VideoSelect',
  props: {
    fileNames: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedVideoFiles: [],
    };
  },
  methods: {
    isSelected(fileName) {
      return this.selectedVideoFiles.includes(fileName);
    },
    toggleSelection(fileName) {
      if (this.isSelected(fileName)) {
        this.selectedVideoFiles = this.selectedVideoFiles.filter(f => f !== fileName);
      } else {
        this.selectedVideoFiles.push(fileName);
      }
      this.updateStoreWithSelection();
    },
    updateStoreWithSelection() {
      const fileStore = useFileStore();
      fileStore.handleVideoSelection([...this.selectedVideoFiles]);
    },
  },
  mounted() {
    const fileStore = useFileStore();
    this.selectedVideoFiles = [...fileStore.selectedFileNames];
  }
};
</script>