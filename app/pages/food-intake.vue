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

        <!-- Food List -->
        <UCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">Selected Date Intake</h3>
          </template>
          <UTable :data="displayedFoods" :columns="columns" class="mt-4">
            <template #actions-data="{ row }">
              <UButton
                icon="i-heroicons-pencil"
                size="sm"
                color="gray"
                variant="ghost"
                @click="editFood(row)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                @click="deleteFood(row.id)"
              />
            </template>
          </UTable>
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
import { watch, shallowRef, ref, computed } from "vue";

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

const displayedFoods = computed(() => {
  return foodStore.logsForDate(selectedDate.value.toString());
});

const columns = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "label", header: "Food" },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "unit", header: "Unit" },
  { accessorKey: "calories", header: "Calories" },
  { accessorKey: "protein", header: "Protein (g)" },
  { accessorKey: "carbs", header: "Carbs (g)" },
];

function updateFoodState(selectedFood) {
  foodState.value = {
    id: selectedFood.id,
    label: selectedFood.label,
    quantity: selectedFood.quantity || 1,
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

  // Forçar reavaliação do computed
  displayedFoods.value; // Isso força o Vue a recomputar o computed

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
      foodState.value.quantity = selectedFood.defaultQuantity || 1;
    }
  },
  { deep: true }
);
</script>
