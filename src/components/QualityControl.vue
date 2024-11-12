<template>
  <div class="p-3 bg-white border border-gray-200 shadow-md rounded-md space-y-2">
    <!-- Quality Control Header, Export Button, and Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Export Button (only visible when conditions are met) -->
        <button
          v-if="showExportButton"
          @click="downloadUpdatedCSV"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          title="Download Updated CSV"
        >
          📥 Export
        </button>

        <!-- Quality Control Header -->
        <span class="ml-1 text-gray-700 text-lg font-bold">Quality Control</span>
      </div>
      
      <!-- Quality Control Toggle -->
      <input
        type="checkbox"
        v-model="qualityControlEnabled"
        @change="toggleQualityControl"
        class="w-6 h-6 text-blue-500"
      />
    </div>

    <!-- CSV Upload and Dynamic QC Variable Selection -->
    <div v-if="qualityControlEnabled">
      <!-- CSV Upload Section -->
      <label class="block text-gray-600 font-medium">Upload QC CSV</label>
      <input type="file" accept=".csv" @change="handleCSVUpload" class="mt-1" />

      <!-- Dynamic QC Variable Dropdowns with Type Selection -->
      <div v-for="(variable, index) in selectedQCVariables" :key="index" class="mt-4">
        <div class="flex space-x-4 items-center">
          <!-- QC Variable Selection Dropdown -->
          <div class="flex-1">
            <label :for="`qc-variable-${index + 1}`" class="text-gray-600 font-medium">QC Variable {{ index + 1 }}</label>
            <select
              :id="`qc-variable-${index + 1}`"
              class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              v-model="selectedQCVariables[index].name"
              @change="updateQCVariable(index)"
            >
              <option value="">Select a column</option>
              <option v-for="col in qcStore.qcColumnOptions" :key="col" :value="col">{{ col }}</option>
            </select>
          </div>

          <!-- QC Variable Type Selection Dropdown -->
          <div class="flex-1">
            <label :for="`qc-type-${index + 1}`" class="text-gray-600 font-medium">Type</label>
            <select
              :id="`qc-type-${index + 1}`"
              class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              v-model="selectedQCVariables[index].type"
              @change="updateQCVariable(index)"
            >
              <option value="">Select type</option>
              <option value="pass-fail">Pass/Fail</option>
              <option value="character">Character</option>
            </select>
          </div>

          <!-- Delete QC Variable Button -->
          <button
            v-if="selectedQCVariables.length > 1 || !isCsvUploaded"
            @click="removeQCVariable(index)"
            class="text-red-500 hover:text-red-700 transition"
            title="Remove QC Variable"
          >
            ❌
          </button>
        </div>
      </div>

      <!-- Button to add another QC Variable, shown only if the last dropdown is selected -->
      <button
        v-if="isLastVariableValid"
        @click="addQCVariable"
        class="text-md w-6 h-6 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
      >
        +
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useQCStore } from '@/stores/useQCStore';

export default {
  name: 'QualityControl',
  setup() {
    const qcStore = useQCStore();
    const qualityControlEnabled = ref(qcStore.qualityControlEnabled);
    const selectedQCVariables = ref([{ name: '', type: '' }]);
    const isCsvUploaded = ref(false);

    const toggleQualityControl = () => {
      qcStore.toggleQualityControl();
    };

    const handleCSVUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          qcStore.setQualityControlData(reader.result);
          isCsvUploaded.value = true;
          if (!selectedQCVariables.value.length) {
            selectedQCVariables.value.push({ name: '', type: '' });
          }
        };
        reader.readAsText(file);
      }
    };

    const updateQCVariable = (index) => {
      qcStore.setQCVariable(index, selectedQCVariables.value[index]);
    };

    const addQCVariable = () => {
      selectedQCVariables.value.push({ name: '', type: '' });
    };

    const removeQCVariable = (index) => {
      if (selectedQCVariables.value.length > 1) {
        selectedQCVariables.value.splice(index, 1);
        qcStore.removeQCVariable(index);
      } else {
        selectedQCVariables.value[0].name = '';
        selectedQCVariables.value[0].type = '';
        updateQCVariable(0);
      }
    };

    const isLastVariableValid = computed(() => {
      const lastVariable = selectedQCVariables.value[selectedQCVariables.value.length - 1];
      return lastVariable && lastVariable.name && lastVariable.type;
    });

    const showExportButton = computed(() => {
      return isCsvUploaded.value && selectedQCVariables.value.some(variable => variable.name && variable.type);
    });

    const downloadUpdatedCSV = () => {
      const updatedData = qcStore.getUpdatedCSVData();
      const blob = new Blob([updatedData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'updated_qc_data.csv';
      link.click();
      URL.revokeObjectURL(url);
    };

    watch(selectedQCVariables, () => {
      qcStore.selectedQCVariables = selectedQCVariables.value;
    }, { deep: true });

    return {
      qcStore,
      qualityControlEnabled,
      selectedQCVariables,
      toggleQualityControl,
      handleCSVUpload,
      updateQCVariable,
      addQCVariable,
      removeQCVariable,
      isLastVariableValid,
      isCsvUploaded,
      showExportButton,
      downloadUpdatedCSV,
    };
  },
};
</script>