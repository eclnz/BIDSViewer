<template>
  <!-- Quality Control Box -->
  <div v-if="hasValidVariable" class="bg-white p-3 mt-4 rounded-lg shadow-sm border border-gray-200">
    <h4 class="text-md font-semibold text-gray-800 mb-2 text-center">Quality Control</h4>

    <!-- Quality Control Variables (only visible when more than one valid) -->
    <div :class="[filteredVariables.length === 1 ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4']">
      <div 
        v-for="(variable, index) in filteredVariables" 
        :key="index" 
        class="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow transition-shadow duration-200"
      >
        <!-- Variable Name -->
        <label 
          :for="`qc-variable-${index}`" 
          class="text-gray-700 text-sm font-medium max-w-28 truncate text-center"
        >
          {{ variable.name }}
        </label>

        <!-- Variable Contents -->
        <div class="w-full flex justify-center mt-2">

          <!-- Pass/Fail Type Variable -->
          <template v-if="variable.type === 'pass-fail'">

            <!-- Pass/Fail Buttons -->
            <div class="flex space-x-2">
              <button
                :class="{
                  'bg-green-300 text-white': qcEntries[variable.name] === 'pass',
                  'bg-gray-200 text-gray-700': qcEntries[variable.name] !== 'pass'
                }"
                @click="setEntry(variable.name, 'pass')"
                class="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none transition-colors duration-200"
              >
                ✅
              </button>
              <button
                :class="{
                  'bg-red-300 text-white': qcEntries[variable.name] === 'fail',
                  'bg-gray-200 text-gray-700': qcEntries[variable.name] !== 'fail'
                }"
                @click="setEntry(variable.name, 'fail')"
                class="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none transition-colors duration-200"
              >
                ❌
              </button>
            </div>
          </template>
          
          <!-- Character Type Variable -->
          <template v-else-if="variable.type === 'character'">
            <input
              :id="`qc-variable-${index}`"
              v-model="qcEntries[variable.name]"
              @input="setEntry(variable.name, qcEntries[variable.name])"
              type="text"
              placeholder="..."
              class="w-full max-w-28 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-center"
            />
          </template>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useQCStore } from '@/stores/useQCStore';

export default {
  name: 'ScanQualityControlEntry',
  props: {
    groupKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const qcStore = useQCStore();
    const qcEntries = ref({});

    // Load entries for the current group and refresh qcEntries
    const loadEntriesForGroup = () => {
      const entriesForGroup = qcStore.getQCEntriesForGroup(props.groupKey);
      qcEntries.value = { ...entriesForGroup };
    };

    // Computed property to include QC variables and reflect changes in entries dynamically
    const qcVariablesWithEntries = computed(() => {
      return qcStore.selectedQCVariables.map((variable) => ({
        ...variable,
        entry: qcEntries.value[variable.name] || ''
      }));
    });

    // Filter out variables with both a name and type selected
    const filteredVariables = computed(() => 
      qcVariablesWithEntries.value.filter(variable => variable.name && variable.type)
    );

    // Computed property to check if there's at least one valid variable
    const hasValidVariable = computed(() => filteredVariables.value.length > 0);

    // Watch for changes in selectedQCVariables and qcEntries in the QC store to refresh UI
    watch(
      [() => qcStore.selectedQCVariables, () => qcStore.qcEntries],
      loadEntriesForGroup,
      { immediate: true, deep: true }
    );

    // Set or update the QC entry for a specific variable
    const setEntry = (variableName, value) => {
      qcEntries.value[variableName] = value;
      qcStore.setQCEntry(props.groupKey, variableName, value);
    };

    onMounted(loadEntriesForGroup);

    return {
      qcStore,
      qcEntries,
      filteredVariables,
      hasValidVariable,
      setEntry,
    };
  },
};
</script>