import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useQCStore = defineStore('qcStore', () => {
  const qualityControlEnabled = ref(false);
  const qcData = ref([]);
  const qcColumnOptions = ref([]);
  const selectedQCVariables = ref([{ name: '', type: '' }]);
  const qcEntries = ref({});

  // Normalize status for pass/fail consistency
  const normalizeStatus = (value) => {
    const passValues = ["y", "yes", "pass", "p"];
    const failValues = ["n", "no", "fail", "f"];
    const normalizedValue = value?.toString().trim().toLowerCase();
    if (passValues.includes(normalizedValue)) return "pass";
    if (failValues.includes(normalizedValue)) return "fail";
    return "";
  };

  // Async function to compute initial QC entries, applying normalization conditionally
  const computeInitialQCEntries = async () => {
    qcEntries.value = {}; // Reset entries

    for (const variable of selectedQCVariables.value) {
      if (variable.name && variable.type) {
        for (const entry of qcData.value) {
          const subject = entry.Subject;
          const session = entry.Session;

          if (subject && session) {
            const groupKey = `${subject} / ${session}`;
            let status = entry[variable.name];

            // Apply normalization only if the variable type is "pass-fail"
            if (variable.type === 'pass-fail') {
              status = normalizeStatus(status);
            }

            if (!qcEntries.value[groupKey]) qcEntries.value[groupKey] = {};
            qcEntries.value[groupKey][variable.name] = status;
          }

          // Yield control back to the event loop occasionally
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    }
  };

  const toggleQualityControl = async () => {
    qualityControlEnabled.value = !qualityControlEnabled.value;
    if (qualityControlEnabled.value) {
      await computeInitialQCEntries(); // Compute entries asynchronously when QC is enabled
    }
  };

  const setQualityControlData = async (csvText) => {
    const rows = csvText.split('\n').map((row) => row.split(','));
    const headers = rows[0];

    qcColumnOptions.value = headers;
    qcData.value = rows.slice(1).map((row) => {
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index];
      });
      return rowObject;
    });

    await computeInitialQCEntries(); // Recompute entries asynchronously when new data is loaded
  };

  const setQCVariable = async (index, variable) => {
    if (index >= selectedQCVariables.value.length) {
      selectedQCVariables.value.push(variable);
    } else {
      selectedQCVariables.value[index] = variable;
    }
    await computeInitialQCEntries(); // Recompute entries asynchronously when variables are updated
  };

  const removeQCVariable = async (index) => {
    const variable = selectedQCVariables.value[index];
    selectedQCVariables.value.splice(index, 1); // Remove variable from list

    if (variable && variable.name) {
      // Remove entries related to this variable from each group in qcEntries
      for (const groupKey in qcEntries.value) {
        delete qcEntries.value[groupKey][variable.name];
      }
    }

    await computeInitialQCEntries(); // Recompute entries asynchronously after removing a variable
  };

  const setQCEntry = (groupKey, variableName, value) => {
    if (!qcEntries.value[groupKey]) qcEntries.value[groupKey] = {};

    // Find the variable type from selectedQCVariables
    const variable = selectedQCVariables.value.find(v => v.name === variableName);
    if (variable && variable.type === 'pass-fail') {
      qcEntries.value[groupKey][variableName] = normalizeStatus(value);
    } else {
      qcEntries.value[groupKey][variableName] = value; // Leave character entries as is
    }
  };

  const getQCEntriesForGroup = (groupKey) => {
    return qcEntries.value[groupKey] || {};
  };

  const getUpdatedCSVData = () => {
    // Define the headers based on the original CSV headers
    const updatedHeaders = [...qcColumnOptions.value];
  
    // Iterate through qcData to construct rows, updating entries with qcEntries data if available
    const updatedData = qcData.value.map(entry => {
      const subject = entry.Subject;
      const session = entry.Session;
      const groupKey = `${subject} / ${session}`;
      const qcEntry = qcEntries.value[groupKey] || {};
  
      // Overwrite matched QC variables with updated qcEntry values
      const updatedRow = { ...entry };
      selectedQCVariables.value.forEach(variable => {
        if (variable.name && updatedHeaders.includes(variable.name)) {
          updatedRow[variable.name] = qcEntry[variable.name] || entry[variable.name] || "";
        }
      });
  
      // Ensure the row matches the headers exactly, filling in any missing headers
      return updatedHeaders.reduce((row, header) => {
        row[header] = updatedRow[header] || "";
        return row;
      }, {});
    });
  
    // Build CSV content with headers and rows formatted properly
    const csvContent = [
      updatedHeaders.join(','), // Header row
      ...updatedData.map(row => 
        updatedHeaders.map(header => `"${row[header] || ""}"`).join(',')
      ),
    ].join('\n');
  
    return csvContent;
  };

  return {
    qualityControlEnabled,
    qcData,
    qcColumnOptions,
    selectedQCVariables,
    qcEntries,
    toggleQualityControl,
    setQualityControlData,
    setQCVariable,
    removeQCVariable,
    setQCEntry,
    getQCEntriesForGroup,
    getUpdatedCSVData,
  };
});