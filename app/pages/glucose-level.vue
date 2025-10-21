<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Glucose Level Tracking"
        description="Record blood glucose readings with timestamps, context and notes."
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

        <!-- Add Reading -->
        <UCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">Add Glucose Reading</h3>
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
              label="Glucose (mg/dL)"
              name="value"
              required
            >
              <UInputNumber
                v-model="form.value"
                :min="20"
                :max="600"
                placeholder="e.g. 110"
                class="w-full"
                color="neutral"
              />
            </UFormField>

            <UFormField
              class="w-full"
              label="Test context"
              name="context"
              required
            >
              <USelect
                v-model="form.context"
                :items="contextItems"
                value-key="value"
                class="w-full"
                placeholder="Select..."
              />
            </UFormField>

            <UFormField class="w-full lg:col-span-4" label="Notes (optional)">
              <UTextarea
                v-model="form.notes"
                class="w-full"
                placeholder="Any notes..."
                :rows="2"
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
                Add Reading
              </UButton>
            </div>
          </UForm>
        </UCard>

        <!-- Daily Table -->

        <UCard class="mt-6">
          <template #header>
            <ClientOnly>
              <div class="flex items-center justify-between">
                <h3 class="text-sm md:text-lg font-semibold">
                  Readings for selected day
                </h3>
                <div class="text-sm text-muted-foreground">
                  Avg: <span class="font-medium">{{ dailyAvg }}</span> mg/dL
                  <span class="mx-2">•</span>
                  Count: <span class="font-medium">{{ dayRows.length }}</span>
                </div>
              </div>
            </ClientOnly>
          </template>

          <ClientOnly>
            <!-- DESKTOP: tabela normal -->
            <div class="hidden md:block">
              <UTable :data="tableData" :columns="columns" class="mt-4">
                <!-- Status -->
                <template #status-cell="{ row }">
                  <UBadge
                    :color="statusColor(row.original._status)"
                    variant="subtle"
                    class="justify-center"
                  >
                    {{ prettyStatus(row.original._status) }}
                  </UBadge>
                </template>

                <!-- Notes (tooltip) -->
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

                <!-- Ações -->
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

            <!-- MOBILE: cards no lugar de tabela -->
            <div class="md:hidden mt-4 space-y-3">
              <UCard class="p-3">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-muted-foreground">Summary</div>
                </div>
                <div class="mt-2 grid grid-cols-2 text-center">
                  <div>
                    <div class="text-xs text-muted-foreground">Avg (mg/dL)</div>
                    <div class="font-medium">{{ dailyAvg }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-muted-foreground">Count</div>
                    <div class="font-medium">{{ dayRows.length }}</div>
                  </div>
                </div>
              </UCard>

              <UCard v-for="item in tableData" :key="item.id" class="p-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm text-muted-foreground">
                      {{ formatDateTime(item.datetimeIso) }}
                    </div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div class="text-muted-foreground">Context:</div>
                      <div>{{ contextLabel(item.context) }}</div>

                      <div class="text-muted-foreground">Value:</div>
                      <div class="font-medium">{{ item.value }} mg/dL</div>

                      <div class="text-muted-foreground">Status:</div>
                      <div>
                        <UBadge
                          :color="statusColor(item._status)"
                          variant="subtle"
                        >
                          {{ prettyStatus(item._status) }}
                        </UBadge>
                      </div>

                      <div class="text-muted-foreground">Notes:</div>
                      <div>
                        <template v-if="item.notes">
                          <UTooltip :text="item.notes">
                            <span
                              class="truncate max-w-[220px] underline decoration-dotted"
                            >
                              <!-- {{ item.notes }} -->
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
                      aria-label="Delete reading"
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

              <!-- Resumo (mobile) -->
            </div>

            <!-- Confirm delete modal (mantido) -->
            <UModal
              v-model:open="confirmOpen"
              :dismissible="false"
              title="Delete reading?"
              description="Confirm deletion of the selected reading."
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
                    <span class="font-medium">Context:</span>
                    {{ pendingItem ? contextLabel(pendingItem.context) : "" }}
                  </li>
                  <li>
                    <span class="font-medium">Value:</span>
                    {{ pendingItem?.value }} mg/dL
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
import { useGlucoseStore } from "~/stores/glucose";
import { shallowRef, ref, reactive, computed } from "vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import * as z from "zod";
const toast = useToast();

/* Date picker state (same pattern as food-intake) */
const df = new DateFormatter("en-US", { dateStyle: "medium" });
const now = new Date();
const viewDate = shallowRef(
  new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
);

/* Store */
const g = useGlucoseStore();
const contextItems = g.contexts;

/* Form */
const pad2 = (n) => String(n).padStart(2, "0");
const toLocalDatetimeInput = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;

const form = reactive({
  datetimeIso: toLocalDatetimeInput(new Date()),
  value: 110,
  context: "fasting",
  notes: "",
});

/* Validation */
const schema = z.object({
  datetimeIso: z.string().min(1, { message: "Date & time is required" }),
  value: z.coerce
    .number()
    .min(20, { message: "Value must be ≥ 20 mg/dL" })
    .max(600, { message: "Value must be ≤ 600 mg/dL" }),
  context: z.string().min(1, { message: "Context is required" }),
  notes: z.string().optional(),
});

/* Helpers */
function prettyStatus(st) {
  return st === "low" ? "Low" : st === "high" ? "High" : "In-Range";
}
function statusColor(st) {
  return st === "low" ? "warning" : st === "high" ? "error" : "success";
}
function contextLabel(val) {
  const it = contextItems.find((c) => c.value === val);
  return it ? it.label : val;
}
function formatDateTime(isoLike) {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  return d.toLocaleString();
}

/* Table data */
const dayRows = computed(() => g.logsForDate(viewDate.value.toString()));
const dailyAvg = computed(() => g.avgForDate(viewDate.value.toString()));
const tableData = computed(() =>
  dayRows.value.map((r) => ({
    ...r,
    _status: g.statusFor(Number(r.value), r.context),
  }))
);

/* Columns (desktop) */
const columns = [
  {
    accessorKey: "datetimeIso",
    header: "Date/Time",
    cell: ({ row }) => formatDateTime(row.original.datetimeIso),
  },
  {
    accessorKey: "context",
    header: "Context",
    cell: ({ row }) => contextLabel(row.original.context),
  },
  { accessorKey: "value", header: "Value (mg/dL)" },
  { id: "status", header: "Status" },
  { id: "notes", header: "Notes" },
  { id: "actions", header: "Actions" },
];

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
  g.deleteLog(id);
  toast.add({
    title: "Reading removed",
    description: `${formatDateTime(removed.datetimeIso)} • ${contextLabel(
      removed.context
    )} • ${removed.value} mg/dL`,
    icon: "i-lucide-trash-2",
    color: "error",
  });
  confirmOpen.value = false;
  pendingItem.value = null;
}

/* Submit */
async function onSubmit() {
  const payload = {
    datetimeIso: form.datetimeIso,
    value: form.value,
    context: form.context,
    notes: form.notes,
  };
  g.addLog(payload);
  toast.add({
    title: "Reading added",
    description: `${formatDateTime(payload.datetimeIso)} • ${contextLabel(
      payload.context
    )} • ${payload.value} mg/dL`,
    icon: "i-lucide-check",
    color: "success",
  });
  form.datetimeIso = toLocalDatetimeInput(new Date());
  form.value = 110;
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
