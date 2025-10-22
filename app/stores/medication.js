// stores/medication.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMedicationStore = defineStore(
  "medication",
  () => {
    // Logs: { id, datetimeIso, name, type, dose, unit, route, notes }
    const logs = ref([]);

    // Sugestões (opcionais) para selects
    const types = [
      { value: "insulin_basal", label: "Insulin (basal/long-acting)" },
      { value: "insulin_bolus", label: "Insulin (bolus/rapid-acting)" },
      { value: "metformin", label: "Metformin" },
      { value: "sulfonylurea", label: "Sulfonylurea" },
      { value: "sglt2", label: "SGLT2 inhibitor" },
      { value: "glp1", label: "GLP-1 agonist" },
      { value: "dpp4", label: "DPP-4 inhibitor" },
      { value: "other", label: "Other" },
    ];

    const units = [
      { value: "unit", label: "unit (IU)" }, // insulina
      { value: "mg", label: "mg" }, // metformin etc.
      { value: "mcg", label: "mcg" },
      { value: "g", label: "g" },
      { value: "ml", label: "mL" },
      { value: "tablet", label: "tablet/pill" },
      { value: "capsule", label: "capsule" },
      { value: "drop", label: "drop(s)" },
    ];

    const routes = [
      { value: "oral", label: "Oral" },
      { value: "subcutaneous", label: "Subcutaneous" },
      { value: "intramuscular", label: "Intramuscular" },
      { value: "inhaled", label: "Inhaled" },
      { value: "topical", label: "Topical" },
      { value: "other", label: "Other" },
    ];

    function addLog({ datetimeIso, name, type, dose, unit, route, notes }) {
      logs.value = [
        ...logs.value,
        {
          id: Date.now(),
          datetimeIso,
          name: String(name || "").trim(),
          type: type || "other",
          dose: Number(dose),
          unit: unit || "",
          route: route || "oral",
          notes: notes || "",
        },
      ];
    }

    function updateLog(id, data) {
      logs.value = logs.value.map((l) => (l.id === id ? { ...l, ...data } : l));
    }

    function deleteLog(id) {
      logs.value = logs.value.filter((l) => l.id !== id);
    }

    function clearAll() {
      logs.value = [];
    }

    // Helpers por data (YYYY-MM-DD)
    function logsForDate(dateIso) {
      return logs.value
        .filter((l) => (l.datetimeIso || "").slice(0, 10) === dateIso)
        .sort((a, b) => (a.datetimeIso > b.datetimeIso ? 1 : -1));
    }

    const countAll = computed(() => logs.value.length);

    return {
      logs,
      types,
      units,
      routes,
      addLog,
      updateLog,
      deleteLog,
      clearAll,
      logsForDate,
      countAll,
    };
  },
  {
    // Persistência local (igual aos outros)
    persist: process.client ? { storage: localStorage } : false,
  }
);
