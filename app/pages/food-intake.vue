<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Food Intake Tracking"
        description="Log your daily food consumption and track nutritional intake."
      />

      <UPageBody>
        <!-- Date Selection -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold col-span-1 lg:col-span-5">
              Choose the Entry Date
            </h3>
          </template>
          <UPopover>
            <UButton
              class="w-full"
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
            >
              {{
                selectedDate
                  ? df.format(selectedDate.toDate(getLocalTimeZone()))
                  : "Select a date"
              }}
            </UButton>

            <template #content>
              <UCalendar
                size="xl"
                color="neutral"
                v-model="selectedDate"
                class="p-2"
              />
            </template>
          </UPopover>
        </UCard>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold col-span-1 lg:col-span-5">
              Add Food Item
            </h3>
          </template>

          <UForm
            class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mt-4"
          >
            <div class="col-span-1 lg:col-span-2 flex items-center">
              <UFormField class="w-full" label="Food">
                <USelectMenu
                  class="w-full"
                  placeholder="Search or enter food name..."
                  v-model="foodState"
                  :items="foodStore.foodDatabase"
                />
              </UFormField>
            </div>
            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Unit of Measure">
                <UInput
                  v-model="foodState.unit"
                  placeholder="unit"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>
            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Quantity">
                <UInputNumber
                  v-model="foodState.quantity"
                  :min="1"
                  placeholder="Enter quantity"
                  class="w-full"
                  color="neutral"
                />
              </UFormField>
            </div>
            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Calories">
                <UInput
                  :value="(foodState.calories || 0) * (foodState.quantity || 1)"
                  placeholder="Total Calories"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>
            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Protein (g)">
                <UInput
                  :value="(foodState.protein || 0) * (foodState.quantity || 1)"
                  placeholder="Total Protein"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>
            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Carbs (g)">
                <UInput
                  :value="(foodState.carbs || 0) * (foodState.quantity || 1)"
                  placeholder="Total Carbs"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>

            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Action">
                <UButton
                  block
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="subtle"
                  class="w-full text-center cursor-pointer"
                  @click="addFood"
                  >Add</UButton
                >
              </UFormField>
            </div>
          </UForm>
        </UCard>

        <UCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">Entries for selected Date</h3>
          </template>
          <ClientOnly>
            <UTable
              :data="tableData"
              :columns="columns"
              :key="tableKey"
              class="mt-4 text-center"
            >
              <template #actions-cell="{ row }">
                <div class="flex gap-2 justify-center">
                  <!-- <UButton
                  icon="i-heroicons-pencil"
                  size="sm"
                  color="gray"
                  variant="ghost"
                  @click="editFood(row)"
                /> -->
                  <UButton
                    class="cursor-pointer"
                    icon="i-heroicons-trash"
                    size="sm"
                    color="red"
                    variant="ghost"
                    @click="deleteFood(row.original.id ?? row.original.foodId)"
                  />
                </div>
              </template> </UTable
          ></ClientOnly>
        </UCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup>
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useFoodStore } from "~/stores/food";
import { watch, shallowRef, ref, computed, nextTick } from "vue";
import { h } from "vue";
const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

const now = new Date();
const selectedDate = shallowRef(
  new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
);

const foodStore = useFoodStore();

const foodState = ref({
  id: null,
  label: null,
  quantity: 1,
  unit: "",
  calories: 0,
  protein: 0,
  carbs: 0,
});

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const tableData = computed(() =>
  foodStore.logsForDate(selectedDate.value.toString()).map((r) => ({
    ...r,
    calories: toNum(r.calories),
    protein: toNum(r.protein),
    carbs: toNum(r.carbs),
  }))
);
const tableKey = ref(0); // Chave dinâmica para forçar atualização
const displayedFoods = computed(() => {
  return foodStore.logsForDate(selectedDate.value.toString());
});

const columns = [
  {
    accessorKey: "date",
    header: () => h("div", { class: "text-center" }, "Date"),
  },
  {
    accessorKey: "label",
    header: () => h("div", { class: "text-center" }, "Food"),
  },
  {
    accessorKey: "quantity",
    header: () => h("div", { class: "text-center" }, "Quantity"),
  },
  {
    accessorKey: "unit",
    header: () => h("div", { class: "text-center" }, "Unit"),
  },
  {
    accessorKey: "calories",
    header: () => h("div", { class: "text-center" }, "Calories"),
    footer: ({ table }) => {
      const total = table
        .getRowModel()
        .rows.reduce((acc, row) => acc + toNum(row.getValue("calories")), 0);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(total);
      return h(
        "div",
        { class: "text-center font-medium" },
        `Total: ${formatted}`
      );
    },
    cell: ({ row }) => {
      const amount = toNum(row.getValue("calories"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(amount);
      return h("div", { class: "text-center font-medium" }, formatted);
    },
  },
  {
    accessorKey: "protein",
    header: () => h("div", { class: "text-center" }, "Protein"),
    footer: ({ table }) => {
      const total = table
        .getRowModel()
        .rows.reduce((acc, row) => acc + toNum(row.getValue("protein")), 0);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(total);
      return h(
        "div",
        { class: "text-center font-medium" },
        `Total: ${formatted}`
      );
    },
    cell: ({ row }) => {
      const amount = toNum(row.getValue("protein"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(amount);
      return h("div", { class: "text-center font-medium" }, formatted);
    },
  },
  {
    accessorKey: "carbs",
    header: () => h("div", { class: "text-center" }, "Carbs (g)"),
    footer: ({ table }) => {
      const total = table
        .getRowModel()
        .rows.reduce((acc, row) => acc + toNum(row.getValue("carbs")), 0);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(total);
      return h(
        "div",
        { class: "text-center font-medium" },
        `Total: ${formatted}`
      );
    },
    cell: ({ row }) => {
      const amount = toNum(row.getValue("carbs"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
      }).format(amount);
      return h("div", { class: "text-center font-medium" }, formatted);
    },
  },
  {
    id: "actions",
    header: () => h("div", { class: "text-center" }, "Actions"),
  },
];

function updateFoodState(selectedFood) {
  foodState.value = {
    id: selectedFood.id,
    label: selectedFood.label,
    quantity: 1,
    unit: selectedFood.unit,
    calories: selectedFood.calories,
    protein: selectedFood.protein,
    carbs: selectedFood.carbs,
  };
}

function addFood() {
  if (!foodState.value.id || foodState.value.quantity <= 0) return;

  const foodLog = {
    date: selectedDate.value.toString(),
    foodId: foodState.value.id,
    quantity: foodState.value.quantity,
  };

  foodStore.addLog(foodLog);

  // Forçar atualização da tabela e totais
  tableKey.value += 1;

  // Reset form
  foodState.value = {
    id: null,
    label: null,
    quantity: 1,
    unit: "",
    calories: 0,
    protein: 0,
    carbs: 0,
  };
}

function editFood(row) {
  const selectedFood = foodStore.foodDatabase.find((f) => f.id === row.id);
  if (selectedFood) {
    updateFoodState(selectedFood);
  }
}

function deleteFood(id) {
  foodStore.deleteLog(id);
  tableKey.value += 1;
  console.log("Deleted food log with id:", id);
}

watch(
  () => foodState.value,
  (newValue) => {
    const selectedFood = foodStore.foodDatabase.find(
      (f) => f.id === newValue.id
    );
    if (selectedFood) {
      foodState.value.label = selectedFood.label;
      foodState.value.unit = selectedFood.unit;
      foodState.value.calories = selectedFood.calories;
      foodState.value.protein = selectedFood.protein;
      foodState.value.carbs = selectedFood.carbs;
      //   foodState.value.quantity = selectedFood.defaultQuantity || 1;
    }
  },
  { deep: true }
);
</script>
