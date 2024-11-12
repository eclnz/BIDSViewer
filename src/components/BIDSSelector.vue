<template>
  <div class="p-3 bg-white rounded-lg border border-gray-200 shadow-md text-left w-full max-w-lg">
    <h2 class="text-lg ml-1 font-semibold text-gray-700">Select BIDS Directory</h2>

    <!-- BIDS input folder -->
    <input 
      type="file" 
      webkitdirectory 
      @change="onDirectorySelect"
      class="bg-white mt-2 p-2 border border-grey-100 rounded-md cursor-pointer transition-colors duration-200 hover:border-sky-400"
    />

    <!-- Folder Name -->
    <p v-if="directoryPath" class="text-sm text-gray-800 mt-2">
      Selected Directory: {{ directoryPath }}
    </p>

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-sm text-red-700 bg-red-200 p-2 rounded-md mt-2">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
import { useFileStore } from '@/stores/useFileStore.js';

export default {
  name: 'BIDSSelector',
  data() {
    return {
      directoryPath: '',
      errorMessage: '',
    };
  },
  methods: {
    onDirectorySelect(event) {
      const files = Array.from(event.target.files);
      if (files.length > 0) {
        this.directoryPath = files[0].webkitRelativePath.split('/')[0];
        this.errorMessage = '';

        const fileStore = useFileStore();
        fileStore.organizeFilesByStructure(files);
      } else {
        this.errorMessage = 'Invalid directory: must contain subjects & sessions.';
      }
    },
  },
};
</script>