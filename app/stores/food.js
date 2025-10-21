// stores/food.js
import { defineStore } from "pinia";
import { ref } from "vue"; // Import ref from 'vue', not 'pinia'

export const useFoodStore = defineStore(
  "food",
  () => {
    // Base de alimentos
    const foodDatabase = [
      {
        id: 1,
        label: "Apple",
        unit: "piece",
        calories: 95,
        protein: 0.5,
        carbs: 25,
        defaultQuantity: 1,
      },
      {
        id: 2,
        label: "Banana",
        unit: "piece",
        calories: 105,
        protein: 1.5,
        carbs: 27,
        defaultQuantity: 1,
      },
      {
        id: 3,
        label: "Chicken Breast (cooked)",
        unit: "g",
        calories: 248,
        protein: 46.5,
        carbs: 0,
        defaultQuantity: 150,
      },
      {
        id: 4,
        label: "Brown Rice (cooked)",
        unit: "cup",
        calories: 216,
        protein: 5,
        carbs: 45,
        defaultQuantity: 1,
      },
      {
        id: 5,
        label: "Broccoli (chopped)",
        unit: "cup",
        calories: 31,
        protein: 2.5,
        carbs: 6,
        defaultQuantity: 1,
      },
      {
        id: 6,
        label: "Salmon",
        unit: "g",
        calories: 208,
        protein: 20,
        carbs: 0,
        defaultQuantity: 100,
      },
      {
        id: 7,
        label: "Egg (large)",
        unit: "piece",
        calories: 78,
        protein: 6,
        carbs: 0.5,
        defaultQuantity: 1,
      },
      {
        id: 8,
        label: "Almonds",
        unit: "oz",
        calories: 164,
        protein: 6,
        carbs: 6,
        defaultQuantity: 1,
      },
      {
        id: 9,
        label: "Plain Yogurt",
        unit: "cup",
        calories: 149,
        protein: 8.5,
        carbs: 11.5,
        defaultQuantity: 1,
      },
      {
        id: 10,
        label: "Oatmeal (cooked)",
        unit: "cup",
        calories: 158,
        protein: 6,
        carbs: 27,
        defaultQuantity: 1,
      },
      {
        id: 11,
        label: "Avocado",
        unit: "piece",
        calories: 234,
        protein: 3,
        carbs: 12,
        defaultQuantity: 1,
      },
      {
        id: 12,
        label: "Sweet Potato (medium)",
        unit: "piece",
        calories: 112,
        protein: 2,
        carbs: 26,
        defaultQuantity: 1,
      },
      {
        id: 13,
        label: "Spinach (raw)",
        unit: "cup",
        calories: 7,
        protein: 1,
        carbs: 1.5,
        defaultQuantity: 1,
      },
      {
        id: 14,
        label: "Whole Wheat Bread",
        unit: "piece",
        calories: 138,
        protein: 7,
        carbs: 24,
        defaultQuantity: 2,
      },
      {
        id: 15,
        label: "Peanut Butter",
        unit: "serving",
        calories: 188,
        protein: 8,
        carbs: 6,
        defaultQuantity: 1,
      },
    ];

    // Logs persistidos com ref para reatividade
    const logs = ref([]);

    // Função para filtrar logs por data
    function logsForDate(dateIso) {
      return logs.value
        .filter((l) => l.date === dateIso)
        .map((log) => {
          const food = foodDatabase.find((f) => f.id === log.foodId) || {};
          return {
            id: log.id,
            date: log.date,
            label: food.label || "",
            quantity: log.quantity,
            unit: food.unit || "",
            calories: (food.calories || 0) * log.quantity,
            protein: (food.protein || 0) * log.quantity,
            carbs: (food.carbs || 0) * log.quantity,
          };
        });
    }

    // Ações com reatividade
    function addLog(log) {
      logs.value = [...logs.value, { ...log, id: Date.now() }];
    }

    function updateLog(id, data) {
      const idx = logs.value.findIndex((l) => l.id === id);
      if (idx > -1) {
        logs.value = logs.value.map((l, i) =>
          i === idx ? { ...l, ...data } : l
        );
      }
    }

    function deleteLog(id) {
      logs.value = logs.value.filter((l) => l.id !== id);
    }

    function clearAll() {
      logs.value = [];
    }

    return {
      foodDatabase,
      logs,
      logsForDate,
      addLog,
      updateLog,
      deleteLog,
      clearAll,
    };
  },
  {
    persist: process.client
      ? {
          storage: localStorage,
        }
      : false,
  }
);
