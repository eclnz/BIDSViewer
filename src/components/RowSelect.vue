<template>
  <div class="p-3 bg-white rounded-lg shadow-md border border-gray-200 max-w-lg">
    <label for="row-select" class="ml-1 text-lg font-bold text-gray-700">Group Media By:</label>
    
    <!-- Group Drop Down -->
    <select 
      id="row-select" 
      v-model="selectedGroupBy" 
      @change="updateGrouping" 
      class="mt-2 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="subject">Subject</option> 
      <option value="subject-session">Subject & Session</option>
    </select>
  </div>
</template>

<script>
import { useFileStore } from '@/stores/useFileStore';

export default {
  name: 'RowSelect',
  data() {
    return {
      selectedGroupBy: 'subject-session',
    };
  },
  methods: {
    updateGrouping() {
      const fileStore = useFileStore();
      fileStore.updateGroupBy(this.selectedGroupBy);
    },
  },
};
</script>