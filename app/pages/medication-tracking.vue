<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Medication Tracking"
        description="Log medications with dosage, time, route and notes."
      />

      <UPageBody>
        <!-- Date Selection -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Choose the Day to View</h3>
          </template>

          <UPopover>
            <UButton
              class="w-full"
              color="neutral"
              variant="subtle"
              icon="i-lucide-calendar"
            >
              {{ df.format(viewDate.toDate(getLocalTimeZone())) }}
            </UButton>
            <template #content>
              <UCalendar
                size="xl"
                color="neutral"
                v-model="viewDate"
                class="p-2"
              />
            </template>
          </UPopover>
        </UCard>

        <!-- Add Medication -->
        <UCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">Add Medication</h3>
          </template>

          <UForm
            :schema="schema"
            :state="form"
            class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start"
            @submit="onSubmit"
            @error="onFormError"
          >
            <UFormField
              class="w-full"
              label="Date & Time"
              name="datetimeIso"
              required
            >
              <UInput
                v-model="form.datetimeIso"
                type="datetime-local"
                class="w-full"
              />
            </UFormField>

            <UFormField
              class="w-full"
              label="Medication name"
              name="name"
              required
            >
              <UInput
                v-model="form.name"
                placeholder="e.g. Metformin, Lantus…"
              />
            </UFormField>

            <UFormField class="w-full" label="Type" name="type">
              <USelect
                v-model="form.type"
                :items="med.types"
                value-key="value"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4 lg:col-span-1">
              <UFormField label="Dose" name="dose" required>
                <UInputNumber v-model="form.dose" :min="0.1" :step="0.1" />
              </UFormField>
              <UFormField label="Unit" name="unit" required>
                <USelect
                  v-model="form.unit"
                  :items="med.units"
                  value-key="value"
                />
              </UFormField>
            </div>

            <UFormField class="w-full" label="Route" name="route">
              <USelect
                v-model="form.route"
                :items="med.routes"
                value-key="value"
              />
            </UFormField>

            <UFormField class="w-full lg:col-span-4" label="Notes (optional)">
              <UTextarea
                v-model="form.notes"
                :rows="2"
                placeholder="Any notes…"
              />
            </UFormField>

            <div class="lg:col-span-4 flex justify-end">
              <UButton
                type="submit"
                color="neutral"
                variant="subtle"
                icon="i-lucide-plus"
                class="cursor-pointer"
              >
                Add Medication
              </UButton>
            </div>
          </UForm>
        </UCard>

        <!-- Daily table / mobile cards -->
        <UCard class="mt-6">
          <template #header>
            <ClientOnly>
              <div class="flex items-center justify-between">
                <h3 class="text-sm md:text-lg font-semibold">
                  Medications for selected day
                </h3>
                <div class="text-sm text-muted-foreground">
                  Count: <span class="font-medium">{{ dayRows.length }}</span>
                </div>
              </div>
            </ClientOnly>
          </template>

          <ClientOnly>
            <!-- DESKTOP -->
            <div class="hidden md:block">
              <UTable
                :data="tableData"
                :columns="columns"
                class="mt-4 text-center"
              >
                <!-- dose cell -->
                <template #dose-cell="{ row }">
                  <span class="font-medium">{{ row.original.dose }}</span>
                  <span class="opacity-70 ml-1">{{ row.original.unit }}</span>
                </template>

                <!-- notes tooltip -->
                <template #notes-cell="{ row }">
                  <div class="flex items-center justify-center">
                    <UTooltip
                      v-if="row.original.notes"
                      :text="row.original.notes"
                    >
                      <UButton
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        icon="i-lucide-message-square-text"
                        class="cursor-pointer"
                        aria-label="View notes"
                      />
                    </UTooltip>
                    <span v-else class="opacity-40 text-xs">—</span>
                  </div>
                </template>

                <!-- actions -->
                <template #actions-cell="{ row }">
                  <div class="flex gap-2 justify-center">
                    <UButton
                      icon="i-heroicons-trash"
                      size="sm"
                      color="neutral"
                      variant="subtle"
                      class="cursor-pointer"
                      @click="askDelete(row.original)"
                    />
                  </div>
                </template>
              </UTable>
            </div>

            <!-- MOBILE -->
            <div class="md:hidden mt-4 space-y-3">
              <UCard v-for="item in tableData" :key="item.id" class="p-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm text-muted-foreground">
                      {{ formatDateTime(item.datetimeIso) }}
                    </div>

                    <div class="font-medium">{{ item.name }}</div>

                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div class="text-muted-foreground">Type:</div>
                      <div>{{ typeLabel(item.type) }}</div>

                      <div class="text-muted-foreground">Dose:</div>
                      <div class="font-medium">
                        {{ item.dose }}
                        <span class="opacity-70">{{ item.unit }}</span>
                      </div>

                      <div class="text-muted-foreground">Route:</div>
                      <div>{{ routeLabel(item.route) }}</div>

                      <div class="text-muted-foreground">Notes:</div>
                      <div>
                        <template v-if="item.notes">
                          <UTooltip :text="item.notes">
                            <span
                              class="truncate max-w-[220px] underline decoration-dotted"
                            >
                              <UButton
                                variant="ghost"
                                color="neutral"
                                size="xs"
                                icon="i-lucide-message-square-text"
                                class="cursor-pointer"
                                aria-label="View notes"
                              />
                            </span>
                          </UTooltip>
                        </template>
                        <span v-else class="opacity-40">—</span>
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0">
                    <UButton
                      aria-label="Delete medication"
                      icon="i-heroicons-trash"
                      size="sm"
                      color="neutral"
                      variant="subtle"
                      class="cursor-pointer"
                      @click="askDelete(item)"
                    />
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Confirm delete modal -->
            <UModal
              v-model:open="confirmOpen"
              :dismissible="false"
              title="Delete medication?"
              description="Confirm deletion of the selected entry."
              :close="false"
              :ui="{ footer: 'justify-end' }"
            >
              <template #body>
                <p>You're about to delete:</p>
                <ul class="list-disc pl-10 text-sm">
                  <li>
                    <span class="font-medium">Date/Time:</span>
                    {{ formatDateTime(pendingItem?.datetimeIso) }}
                  </li>
                  <li>
                    <span class="font-medium">Medication:</span>
                    {{ pendingItem?.name }}
                  </li>
                  <li>
                    <span class="font-medium">Dose:</span>
                    {{ pendingItem?.dose }} {{ pendingItem?.unit }}
                  </li>
                </ul>
                <p class="text-sm text-error-300 mt-2">
                  This action cannot be undone.
                </p>
              </template>
              <template #footer>
                <UButton
                  color="neutral"
                  variant="subtle"
                  icon="i-lucide-x"
                  class="cursor-pointer"
                  @click="confirmOpen = false"
                >
                  Cancel
                </UButton>
                <UButton
                  color="error"
                  variant="subtle"
                  icon="i-lucide-trash-2"
                  class="cursor-pointer"
                  @click="confirmDelete"
                >
                  Delete
                </UButton>
              </template>
            </UModal>
          </ClientOnly>
        </UCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup>
import { useMedicationStore } from "~/stores/medication";
import { shallowRef, ref, reactive, computed } from "vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import * as z from "zod";
const toast = useToast();

/* Date picker (mesmo pattern dos outros) */
const df = new DateFormatter("en-US", { dateStyle: "medium" });
const now = new Date();
const viewDate = shallowRef(
  new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
);

/* Store */
const med = useMedicationStore();

/* Helpers para labels */
const typeLabel = (v) => med.types.find((t) => t.value === v)?.label || v;
const routeLabel = (v) => med.routes.find((r) => r.value === v)?.label || v;

/* Form */
const pad2 = (n) => String(n).padStart(2, "0");
const toLocalDatetimeInput = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;

const form = reactive({
  datetimeIso: toLocalDatetimeInput(new Date()),
  name: "",
  type: "other",
  dose: 1,
  unit: "mg",
  route: "oral",
  notes: "",
});

/* Validation (Zod) */
const schema = z.object({
  datetimeIso: z.string().min(1, { message: "Date & time is required" }),
  name: z.string().trim().min(1, { message: "Medication name is required" }),
  type: z.string().optional(),
  dose: z.coerce.number().gt(0, { message: "Dose must be greater than 0" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  route: z.string().optional(),
  notes: z.string().optional(),
});

/* Table data */
const dayRows = computed(() => med.logsForDate(viewDate.value.toString()));
const tableData = computed(() => [...dayRows.value]);

/* Columns (desktop) */
const columns = [
  {
    accessorKey: "datetimeIso",
    header: "Date/Time",
    cell: ({ row }) => formatDateTime(row.original.datetimeIso),
  },
  { accessorKey: "name", header: "Medication" },
  {
    id: "dose",
    header: "Dose",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => typeLabel(row.original.type),
  },
  {
    accessorKey: "route",
    header: "Route",
    cell: ({ row }) => routeLabel(row.original.route),
  },
  { id: "notes", header: "Notes" },
  { id: "actions", header: "Actions" },
];

/* Utils */
function formatDateTime(isoLike) {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  return d.toLocaleString();
}

/* Delete modal */
const confirmOpen = ref(false);
const pendingItem = ref(null);

function askDelete(item) {
  pendingItem.value = item;
  confirmOpen.value = true;
}
function confirmDelete() {
  const id = pendingItem.value?.id;
  if (id == null) {
    confirmOpen.value = false;
    return;
  }
  const removed = pendingItem.value;
  med.deleteLog(id);
  toast.add({
    title: "Medication removed",
    description: `${formatDateTime(removed.datetimeIso)} • ${removed.name} • ${
      removed.dose
    } ${removed.unit}`,
    icon: "i-lucide-trash-2",
    color: "error",
  });
  confirmOpen.value = false;
  pendingItem.value = null;
}

/* Submit */
async function onSubmit() {
  const payload = { ...form };
  med.addLog(payload);

  toast.add({
    title: "Medication added",
    description: `${formatDateTime(payload.datetimeIso)} • ${payload.name} • ${
      payload.dose
    } ${payload.unit}`,
    icon: "i-lucide-check",
    color: "success",
  });

  // reset rápido
  form.datetimeIso = toLocalDatetimeInput(new Date());
  form.name = "";
  form.type = "other";
  form.dose = 1;
  form.unit = "mg";
  form.route = "oral";
  form.notes = "";
}

function onFormError(e) {
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
</script>
