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

          <!-- Form com validação -->
          <UForm
            :schema="schema"
            :state="foodState"
            class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mt-4"
            @submit="onSubmit"
            @error="onFormError"
          >
            <div class="col-span-1 lg:col-span-2 flex items-center">
              <UFormField class="w-full" label="Food" name="id" required>
                <USelectMenu
                  class="w-full"
                  placeholder="Search or enter food name..."
                  v-model="foodState.id"
                  :items="foodOptions"
                  value-key="value"
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
              <UFormField
                class="w-full"
                label="Quantity"
                name="quantity"
                required
              >
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
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>

            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Protein (g)">
                <UInput
                  :value="(foodState.protein || 0) * (foodState.quantity || 1)"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>

            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Carbs (g)">
                <UInput
                  :value="(foodState.carbs || 0) * (foodState.quantity || 1)"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>

            <div class="col-span-1 flex items-center">
              <UFormField class="w-full" label="Action">
                <UButton
                  block
                  type="submit"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="subtle"
                  class="w-full text-center cursor-pointer"
                >
                  Add
                </UButton>
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
                  <UButton
                    class="cursor-pointer"
                    icon="i-heroicons-trash"
                    size="sm"
                    color="red"
                    variant="ghost"
                    @click="deleteFood(row.original.id ?? row.original.foodId)"
                  />
                </div>
              </template>
            </UTable>
          </ClientOnly>
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
import { watch, shallowRef, ref, reactive, computed } from "vue";
import { h } from "vue";
import * as z from "zod"; // <- zod para schema (UI4 suporta Standard Schema) :contentReference[oaicite:4]{index=4}
const toast = useToast();
const df = new DateFormatter("en-US", { dateStyle: "medium" });

const now = new Date();
const selectedDate = shallowRef(
  new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
);

const foodStore = useFoodStore();

// Opções para o SelectMenu (label/value)
const foodOptions = computed(() =>
  foodStore.foodDatabase.map((f) => ({ label: f.label, value: f.id }))
); // :contentReference[oaicite:5]{index=5}

const foodState = reactive({
  id: undefined, // <- v-model do SelectMenu
  label: null,
  quantity: 1,
  unit: "",
  calories: 0,
  protein: 0,
  carbs: 0,
});

// Schema de validação
const schema = z.object({
  id: z
    .union([z.string(), z.number()]) // aceita string ou number...
    .nullable() // ...e também null...
    .optional() // ...ou undefined
    .refine((v) => v !== null && v !== undefined && String(v).length > 0, {
      message: "Food is required",
    }),
  quantity: z.coerce
    .number({ required_error: "Quantity is required" })
    .min(1, { message: "Quantity is required and must be at least 1" }),
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

const tableKey = ref(0);

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

// Atualiza campos quando muda o id (Select)
watch(
  () => foodState.id,
  (newId) => {
    const selectedFood = foodStore.foodDatabase.find((f) => f.id === newId);
    if (selectedFood) {
      foodState.label = selectedFood.label;
      foodState.unit = selectedFood.unit;
      foodState.calories = selectedFood.calories;
      foodState.protein = selectedFood.protein;
      foodState.carbs = selectedFood.carbs;
    }
  }
);

async function onSubmit() {
  // capture o item selecionado e a qty ANTES de resetar no addFood()
  const selectedId = foodState.id;
  const qty = foodState.quantity;
  // se os ids no banco forem números, garanta coerção:
  const added = foodStore.foodDatabase.find(
    (f) => String(f.id) === String(selectedId)
  );

  addFood();

  toast.add({
    title: "Item added",
    description: added ? `${added.label} x ${qty}` : `Quantity: ${qty}`,
    icon: "i-lucide-check",
    color: "success",
  });
}
function onFormError(e) {
  // payload do UForm: pegue a primeira mensagem disponível
  const msg =
    e?.errors?.[0]?.message ||
    e?.message ||
    "Please fix the highlighted errors and try again.";

  toast.add({
    title: "Validation failed",
    description: msg,
    icon: "i-lucide-alert-triangle",
    color: "error",
  });
}

function addFood() {
  const foodLog = {
    date: selectedDate.value.toString(),
    foodId: foodState.id,
    quantity: foodState.quantity,
  };
  foodStore.addLog(foodLog);
  tableKey.value += 1;

  // Reset
  foodState.id = undefined;
  foodState.label = null;
  foodState.quantity = 1;
  foodState.unit = "";
  foodState.calories = 0;
  foodState.protein = 0;
  foodState.carbs = 0;
}

function deleteFood(id) {
  const removed = tableData.value.find((r) => (r.id ?? r.foodId) === id);
  foodStore.deleteLog(id);
  tableKey.value += 1;

  // 🔔 Toast de sucesso (delete)
  toast.add({
    title: "Item removed",
    description: removed ? `${removed.label} × ${removed.quantity}` : undefined,
    icon: "i-lucide-trash-2",
    color: "error",
  });
}
</script>
