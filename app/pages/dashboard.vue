<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Dashboard"
        description="Daily summaries and trends for food, glucose and medications."
      />

      <UPageBody>
        <UCard class="mb-6">
          <template #header>
            <h3 class="text-lg font-semibold">Date range</h3>
          </template>

          <UPopover>
            <UButton
              class="w-full"
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
            >
              <template v-if="range?.start && range?.end">
                {{ df.format(range.start.toDate(getLocalTimeZone())) }} —
                {{ df.format(range.end.toDate(getLocalTimeZone())) }}
              </template>
              <template v-else-if="range?.start">
                {{ df.format(range.start.toDate(getLocalTimeZone())) }} — …
              </template>
              <template v-else> Select date range </template>
            </UButton>

            <template #content>
              <UCalendar
                v-model="range"
                range
                size="xl"
                color="neutral"
                class="p-2"
              />
            </template>
          </UPopover>
        </UCard>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <ClientOnly>
            <UCard class="shadow-md">
              <template #header
                ><div class="font-medium text-sm">
                  Total Carbs in date range
                </div></template
              >
              <div class="text-2xl font-semibold">
                {{ fmt(totalsInRange.carbs) }} g
              </div>
              <div class="text-sm text-muted-foreground">
                {{ mealsInRange }} meals | AVG {{ fmt((totalsInRange.carbs / mealsInRange).toFixed(2)) }} g
              </div>
            </UCard>

            <UCard class="shadow-md">
              <template #header
                ><div class="font-medium text-sm">
                  Total Calories in date range
                </div></template
              >
              <div class="text-2xl font-semibold">
                {{ fmt(totalsInRange.calories) }}
              </div>
              <div class="text-sm text-muted-foreground">
                {{ mealsInRange }} meals | AVG {{ fmt((totalsInRange.calories / mealsInRange).toFixed(2)) }} cal
              </div>
            </UCard>

            <!-- NOVO: Protein -->
            <UCard class="shadow-md">
              <template #header
                ><div class="font-medium text-sm">
                  Total Protein in date range
                </div></template
              >
              <div class="text-2xl font-semibold">
                {{ fmt(totalsInRange.protein) }} g
              </div>
              <div class="text-sm text-muted-foreground">
                {{ mealsInRange }} meals | AVG {{ fmt((totalsInRange.protein / mealsInRange).toFixed(2)) }} g
              </div>
            </UCard>

            <UCard class="shadow-md">
              <template #header
                ><div class="font-medium text-sm">
                  Avg glucose in date range
                </div></template
              >
              <div class="text-2xl font-semibold">
                {{ glucoseAvgInRange ?? "—" }} mg/dL
              </div>
              <div class="text-sm text-muted-foreground">
                {{ glucoseCountInRange }} readings
              </div>
            </UCard>

            <UCard class="shadow-md">
              <template #header
                ><div class="font-medium text-sm">
                  Medications in date range
                </div></template
              >
              <div class="text-2xl font-semibold">{{ medsCountInRange }}</div>
              <div class="text-sm text-muted-foreground">taken/registered</div>
            </UCard>
          </ClientOnly>
        </div>

        <!-- ====== Charts ====== -->
        <!-- Linha 1: 3 gráficos (food) -->
        <div class="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <UCard class="shadow-md" :variant="isDark ? 'solid' : 'outline'">
            <template #header
              ><h3 class="text-lg font-semibold">Carbs over time</h3></template
            >
            <ClientOnly>
              <ApexChart
                type="area"
                height="320"
                :options="carbsOpts"
                :series="carbsSeries"
              />
            </ClientOnly>
          </UCard>

          <UCard class="shadow-md" :variant="isDark ? 'solid' : 'outline'">
            <template #header
              ><h3 class="text-lg font-semibold">
                Calories over time
              </h3></template
            >
            <ClientOnly>
              <ApexChart
                type="area"
                height="320"
                :options="caloriesOpts"
                :series="caloriesSeries"
              />
            </ClientOnly>
          </UCard>

          <UCard class="shadow-md" :variant="isDark ? 'solid' : 'outline'">
            <template #header
              ><h3 class="text-lg font-semibold">
                Protein over time
              </h3></template
            >
            <ClientOnly>
              <ApexChart
                type="area"
                height="320"
                :options="proteinOpts"
                :series="proteinSeries"
              />
            </ClientOnly>
          </UCard>
        </div>
        <!-- Linha 2: 2 gráficos (glucose & meds) -->
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard class="shadow-md" :variant="isDark ? 'solid' : 'outline'">
            <template #header
              ><h3 class="text-lg font-semibold">
                Average glucose over time
              </h3></template
            >
            <ClientOnly>
              <ApexChart
                type="line"
                height="320"
                :options="glucoseOpts"
                :series="glucoseSeries"
              />
            </ClientOnly>
          </UCard>

          <UCard class="shadow-md" :variant="isDark ? 'solid' : 'outline'">
            <template #header
              ><h3 class="text-lg font-semibold">
                Medications per day
              </h3></template
            >
            <ClientOnly>
              <ApexChart
                type="bar"
                height="320"
                :options="medOpts"
                :series="medSeries"
              />
            </ClientOnly>
          </UCard>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup>
import { computed, shallowRef } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { useFoodStore } from "~/stores/food";
import { useGlucoseStore } from "~/stores/glucose";
import { useMedicationStore } from "~/stores/medication";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";

const ApexChart = VueApexCharts;
const colorMode = useColorMode(); // @nuxtjs/color-mode
const isDark = computed(() => colorMode.value === "dark");

/* --------- Range: últimos 10 dias --------- */
const df = new DateFormatter("en-US", { dateStyle: "medium" });
const today = new Date();
const start10 = new Date(today);
start10.setDate(today.getDate() - 6);

const range = shallowRef({
  start: new CalendarDate(
    start10.getFullYear(),
    start10.getMonth() + 1,
    start10.getDate()
  ),
  end: new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  ),
});

/* --------- Utils --------- */
const toKey = (d) => {
  const x = new Date(d);
  if (Number.isNaN(+x)) return "";
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(x.getDate()).padStart(2, "0")}`;
};
const fmt = (n) => new Intl.NumberFormat("en-US").format(Number(n || 0));

function* eachDayKeys(startDate, endDate) {
  if (!startDate) return;
  const d = new Date(startDate);
  const end = new Date(endDate ?? startDate);
  while (d <= end) {
    yield toKey(d);
    d.setDate(d.getDate() + 1);
  }
}

const rangeKeys = computed(() => {
  if (!safeStartDate.value) return [];
  return Array.from(eachDayKeys(safeStartDate.value, safeEndDate.value));
});

const rangeKeySet = computed(() => new Set(rangeKeys.value));

const safeStartDate = computed(() => {
  const s = range.value?.start;
  return s ? s.toDate(getLocalTimeZone()) : null;
});
const safeEndDate = computed(() => {
  // durante a seleção, end pode estar ausente; quando isso ocorrer,
  // usamos o próprio start, assim os gráficos/cards permanecem consistentes
  const s = safeStartDate.value;
  const e = range.value?.end
    ? range.value.end.toDate(getLocalTimeZone())
    : null;
  return e ?? s;
});

/* --------- Stores --------- */
const food = useFoodStore();
const glu = useGlucoseStore();
const med = useMedicationStore();

/* --------- FOOD: enriquecer + agregar por dia no range --------- */
const itemById = computed(() => {
  const m = new Map();
  for (const f of food.foodDatabase || []) m.set(String(f.id), f);
  return m;
});

const foodAgg = computed(() => {
  const cal = new Map(),
    pro = new Map(),
    carb = new Map();
  // inicializa com 0 pra todos os dias do range
  for (const k of rangeKeys.value) {
    cal.set(k, 0);
    pro.set(k, 0);
    carb.set(k, 0);
  }

  for (const log of food.logs || []) {
    const k = log.date;
    if (!k || !cal.has(k)) continue; // fora do range
    const it = itemById.value.get(String(log.foodId));
    if (!it) continue;
    const qty = Number(log.quantity || 0);
    // macros do item * qty
    cal.set(k, cal.get(k) + Number(it.calories || 0) * qty);
    pro.set(k, pro.get(k) + Number(it.protein || 0) * qty);
    carb.set(k, carb.get(k) + Number(it.carbs || 0) * qty);
  }
  return { cal, pro, carb };
});

const caloriesSeries = computed(() => [
  {
    name: "Calories",
    data: rangeKeys.value.map((k) => ({ x: k, y: foodAgg.value.cal.get(k) })),
  },
]);
const carbsSeries = computed(() => [
  {
    name: "Carbs (g)",
    data: rangeKeys.value.map((k) => ({ x: k, y: foodAgg.value.carb.get(k) })),
  },
]);
const proteinSeries = computed(() => [
  {
    name: "Protein (g)",
    data: rangeKeys.value.map((k) => ({ x: k, y: foodAgg.value.pro.get(k) })),
  },
]);

/* --------- GLUCOSE: média diária no range --------- */
const glucoseSeries = computed(() => {
  const vals = new Map();
  // priming com arrays vazios
  for (const k of rangeKeys.value) vals.set(k, []);
  for (const r of glu.logs || []) {
    const k = toKey(r.datetimeIso);
    if (vals.has(k)) vals.get(k).push(Number(r.value));
  }
  const avg = rangeKeys.value.map((k) => {
    const arr = vals.get(k);
    const m = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return { x: k, y: Math.round(m * 10) / 10 };
  });
  return [{ name: "Avg (mg/dL)", data: avg }];
});

/* --------- MEDS: contagem diária no range --------- */
const medSeries = computed(() => {
  const cnt = new Map();
  for (const k of rangeKeys.value) cnt.set(k, 0);
  for (const r of med.logs || []) {
    const k = toKey(r.datetimeIso);
    if (cnt.has(k)) cnt.set(k, cnt.get(k) + 1);
  }
  return [
    {
      name: "Medications",
      data: rangeKeys.value.map((k) => ({ x: k, y: cnt.get(k) })),
    },
  ];
});

/* --------- Apex options (inalterado, só xaxis datetime) --------- */
const baseTimeOpts = {
  chart: { toolbar: { show: false }, animations: { easing: "easeinout" } },
  stroke: { width: 2, curve: "smooth" },
  xaxis: { type: "datetime" },
  tooltip: { shared: false, x: { format: "yyyy-MM-dd" } },
};
const caloriesOpts = {
  ...baseTimeOpts,
  yaxis: { title: { text: "Calories" }, min: 0 },
  dataLabels: { enabled: false },
  legend: { show: false },
};
const carbsOpts = {
  ...baseTimeOpts,
  yaxis: { title: { text: "Carbs (g)" }, min: 0 },
  dataLabels: { enabled: false },
  legend: { show: false },
};
const proteinOpts = {
  ...baseTimeOpts,
  yaxis: { title: { text: "Protein (g)" }, min: 0 },
  dataLabels: { enabled: false },
  legend: { show: false },
};
const glucoseOpts = computed(() => ({
  ...baseTimeOpts,
  yaxis: { title: { text: "mg/dL" }, min: 0 },
  markers: { size: 3 },
  annotations: {
    yaxis: [{ y: 80, y2: 130, opacity: 0.12, fillColor: "#22c55e" }],
  },
}));
const medOpts = {
  ...baseTimeOpts,
  chart: { ...baseTimeOpts.chart, type: "bar" },
  plotOptions: { bar: { columnWidth: "60%", borderRadius: 3 } },
  dataLabels: { enabled: false },
  yaxis: { title: { text: "Count" }, min: 0 },
};

/* ---------- Helpers p/ membership em O(1) ---------- */
// const rangeKeySet = computed(() => new Set(rangeKeys.value));

/* ---------- Meals e Totais no range (food) ---------- */
const mealsInRange = computed(
  () => (food.logs || []).filter((l) => rangeKeySet.value.has(l.date)).length
);

const totalsInRange = computed(() => {
  let calories = 0,
    protein = 0,
    carbs = 0;
  for (const l of food.logs || []) {
    if (!rangeKeySet.value.has(l.date)) continue;
    const it = itemById.value.get(String(l.foodId));
    if (!it) continue;
    const qty = Number(l.quantity || 0);
    calories += Number(it.calories || 0) * qty;
    protein += Number(it.protein || 0) * qty;
    carbs += Number(it.carbs || 0) * qty;
  }
  return { calories, protein, carbs };
});

/* ---------- Glucose no range ---------- */
const glucoseValuesInRange = computed(() => {
  const arr = [];
  for (const r of glu.logs || []) {
    const k = toKey(r.datetimeIso);
    if (rangeKeySet.value.has(k)) arr.push(Number(r.value));
  }
  return arr;
});

const glucoseAvgInRange = computed(() => {
  const arr = glucoseValuesInRange.value;
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
});

const glucoseCountInRange = computed(() => glucoseValuesInRange.value.length);

/* ---------- Medications no range ---------- */
const medsCountInRange = computed(() =>
  (med.logs || []).reduce((acc, r) => {
    const k = toKey(r.datetimeIso);
    return acc + (rangeKeySet.value.has(k) ? 1 : 0);
  }, 0)
);
</script>
