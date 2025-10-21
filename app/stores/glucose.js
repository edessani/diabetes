// stores/glucose.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useGlucoseStore = defineStore(
  "glucose",
  () => {
    // logs de glicose
    // item: { id, datetimeIso, value, context, notes }
    const logs = ref([]);

    // Contextos suportados (usados também pela UI)
    const contexts = [
      { value: "fasting", label: "Fasting" },
      { value: "before_meal", label: "Before meal" },
      { value: "after_meal_1h", label: "1h after meal" },
      { value: "after_meal_2h", label: "2h after meal" },
      { value: "bedtime", label: "Bedtime" },
      { value: "random", label: "Random" },
    ];

    // Faixas-alvo (mg/dL) por contexto — simples e práticas
    // Obs.: isso NÃO é aconselhamento médico; ajuste como preferir.
    const targets = {
      fasting: { low: 70, high: 130 }, // <70 Low, 70–130 in-range, >130 High
      before_meal: { low: 70, high: 130 },
      after_meal_1h: { low: 70, high: 180 },
      after_meal_2h: { low: 70, high: 180 },
      bedtime: { low: 90, high: 140 },
      random: { low: 70, high: 180 },
    };

    function statusFor(value, context) {
      const t = targets[context] || targets.random;
      if (value < t.low) return "low";
      if (value > t.high) return "high";
      return "inrange";
    }

    function addLog({ datetimeIso, value, context, notes }) {
      logs.value = [
        ...logs.value,
        {
          id: Date.now(),
          datetimeIso,
          value: Number(value),
          context,
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

    // Helpers por data (YYYY-MM-DD) — para listagens/estatísticas diárias
    function logsForDate(dateIso) {
      return logs.value
        .filter((l) => (l.datetimeIso || "").slice(0, 10) === dateIso)
        .sort((a, b) => (a.datetimeIso > b.datetimeIso ? 1 : -1));
    }

    function avgForDate(dateIso) {
      const arr = logsForDate(dateIso);
      if (!arr.length) return 0;
      const sum = arr.reduce((acc, l) => acc + Number(l.value || 0), 0);
      return Math.round((sum / arr.length) * 10) / 10;
    }

    const countAll = computed(() => logs.value.length);

    return {
      logs,
      contexts,
      targets,
      statusFor,
      addLog,
      updateLog,
      deleteLog,
      clearAll,
      logsForDate,
      avgForDate,
      countAll,
    };
  },
  {
    persist: process.client ? { storage: localStorage } : false,
  }
);
