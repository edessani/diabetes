// stores/medication.js
import { defineStore } from "pinia";

const STORAGE_KEY = "medication_logs_v1";

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export const useMedicationStore = defineStore("medication", {
  state: () => ({
    // registros
    logs: loadLogs(),

    // ======= PRESETS =======
    // Cada preset define um medicamento comum para preenchimento rápido
    // (nome, via, unidade, doses comuns etc.)
    presets: [
      // Biguanida
      {
        id: "metformin_500",
        label: "Metformin 500 mg",
        class: "Biguanide",
        route: "oral",
        unit: "mg",
        defaultDose: 500,
      },
      {
        id: "metformin_850",
        label: "Metformin 850 mg",
        class: "Biguanide",
        route: "oral",
        unit: "mg",
        defaultDose: 850,
      },
      {
        id: "metformin_1000",
        label: "Metformin 1000 mg",
        class: "Biguanide",
        route: "oral",
        unit: "mg",
        defaultDose: 1000,
      },

      // Sulfonylureas
      {
        id: "glipizide_5",
        label: "Glipizide 5 mg",
        class: "Sulfonylurea",
        route: "oral",
        unit: "mg",
        defaultDose: 5,
      },
      {
        id: "glyburide_5",
        label: "Glyburide 5 mg",
        class: "Sulfonylurea",
        route: "oral",
        unit: "mg",
        defaultDose: 5,
      },
      {
        id: "glimepiride_2",
        label: "Glimepiride 2 mg",
        class: "Sulfonylurea",
        route: "oral",
        unit: "mg",
        defaultDose: 2,
      },

      // SGLT2
      {
        id: "empagliflozin_10",
        label: "Empagliflozin 10 mg",
        class: "SGLT2 inhibitor",
        route: "oral",
        unit: "mg",
        defaultDose: 10,
      },
      {
        id: "dapagliflozin_10",
        label: "Dapagliflozin 10 mg",
        class: "SGLT2 inhibitor",
        route: "oral",
        unit: "mg",
        defaultDose: 10,
      },
      {
        id: "canagliflozin_100",
        label: "Canagliflozin 100 mg",
        class: "SGLT2 inhibitor",
        route: "oral",
        unit: "mg",
        defaultDose: 100,
      },

      // DPP-4
      {
        id: "sitagliptin_100",
        label: "Sitagliptin 100 mg",
        class: "DPP-4 inhibitor",
        route: "oral",
        unit: "mg",
        defaultDose: 100,
      },
      {
        id: "linagliptin_5",
        label: "Linagliptin 5 mg",
        class: "DPP-4 inhibitor",
        route: "oral",
        unit: "mg",
        defaultDose: 5,
      },

      // TZD
      {
        id: "pioglitazone_30",
        label: "Pioglitazone 30 mg",
        class: "Thiazolidinedione",
        route: "oral",
        unit: "mg",
        defaultDose: 30,
      },

      // GLP-1 RA (injeção)
      {
        id: "semaglutide_sc",
        label: "Semaglutide (inj.)",
        class: "GLP-1 RA",
        route: "subcutaneous",
        unit: "mg",
        defaultDose: 0.25,
      },
      {
        id: "liraglutide_sc",
        label: "Liraglutide (inj.)",
        class: "GLP-1 RA",
        route: "subcutaneous",
        unit: "mg",
        defaultDose: 0.6,
      },
      {
        id: "dulaglutide_sc",
        label: "Dulaglutide (inj.)",
        class: "GLP-1 RA",
        route: "subcutaneous",
        unit: "mg",
        defaultDose: 0.75,
      },

      // Insulinas — basal
      {
        id: "glargine_10u",
        label: "Insulin glargine (basal)",
        class: "Insulin (basal)",
        route: "subcutaneous",
        unit: "units",
        defaultDose: 10,
      },
      {
        id: "detemir_10u",
        label: "Insulin detemir (basal)",
        class: "Insulin (basal)",
        route: "subcutaneous",
        unit: "units",
        defaultDose: 10,
      },
      {
        id: "degludec_10u",
        label: "Insulin degludec (basal)",
        class: "Insulin (basal)",
        route: "subcutaneous",
        unit: "units",
        defaultDose: 10,
      },

      // Insulinas — bolus/rápida
      {
        id: "lispro_5u",
        label: "Insulin lispro (rapid)",
        class: "Insulin (bolus)",
        route: "subcutaneous",
        unit: "units",
        defaultDose: 5,
      },
      {
        id: "aspart_5u",
        label: "Insulin aspart (rapid)",
        class: "Insulin (bolus)",
        route: "subcutaneous",
        unit: "units",
        defaultDose: 5,
      },
      {
        id: "glulisine_5u",
        label: "Insulin glulisine (rapid)",
        class: "Insulin (bolus)",
        route: "subcutaneous",
        unit: "units",
        defaultDose: 5,
      },
    ],

    // ======= BUCKETS =======
    // Grupos para filtro/atalhos no UI
    buckets: [
      { key: "all", label: "All" },
      { key: "biguanide", label: "Biguanide", includes: ["Biguanide"] },
      {
        key: "sulfonylurea",
        label: "Sulfonylureas",
        includes: ["Sulfonylurea"],
      },
      { key: "sglt2", label: "SGLT2", includes: ["SGLT2 inhibitor"] },
      { key: "dpp4", label: "DPP-4", includes: ["DPP-4 inhibitor"] },
      { key: "tzd", label: "TZD", includes: ["Thiazolidinedione"] },
      { key: "glp1", label: "GLP-1 RA (inj.)", includes: ["GLP-1 RA"] },
      {
        key: "ins_basal",
        label: "Insulin — Basal",
        includes: ["Insulin (basal)"],
      },
      {
        key: "ins_bolus",
        label: "Insulin — Bolus",
        includes: ["Insulin (bolus)"],
      },
    ],
  }),

  getters: {
    // retorna presets pertencentes ao bucket ativo
    presetsByBucket: (state) => (bucketKey) => {
      if (!bucketKey || bucketKey === "all") return state.presets;
      const bucket = state.buckets.find((b) => b.key === bucketKey);
      if (!bucket) return state.presets;
      return state.presets.filter((p) => bucket.includes?.includes(p.class));
    },

    // util p/ listagem do dia
    logsForDate: (state) => (dateStr) =>
      state.logs.filter((l) => l.date === dateStr),

    countForDate: (state) => (dateStr) =>
      state.logs.filter((l) => l.date === dateStr).length,
  },

  actions: {
    addLog(payload) {
      const id = crypto.randomUUID();
      const entry = { id, ...payload };
      this.logs.unshift(entry);
      saveLogs(this.logs);
      return entry;
    },
    deleteLog(id) {
      this.logs = this.logs.filter((l) => l.id !== id);
      saveLogs(this.logs);
    },
  },
});
