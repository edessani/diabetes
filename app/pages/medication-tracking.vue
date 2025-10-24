<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Medication Tracking"
        description="Log medications with dosage, time, route and notes."
      />

      <UPageBody>
        <!-- Date filter (igual ao pattern anterior) -->
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

        <!-- Buckets + Quick picks -->
        <UCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">Quick buckets</h3>
          </template>

          <!-- Buckets (chips) -->
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="b in buckets"
              :key="b.key"
              size="sm"
              :variant="activeBucket === b.key ? 'solid' : 'subtle'"
              color="neutral"
              @click="activeBucket = b.key"
            >
              {{ b.label }}
            </UButton>
          </div>

          <!-- Quick-pick (chips dos presets do bucket) -->
          <template #footer>
            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                v-for="p in bucketPresets"
                :key="p.id"
                size="sm"
                variant="subtle"
                color="neutral"
                @click="applyPreset(p)"
                :title="`${p.class} • ${p.route}`"
              >
                {{ p.label }}
              </UButton>
            </div></template
          >
        </UCard>

        <!-- Form -->
        <UCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">Add Medication</h3>
          </template>

          <UForm
            :schema="schema"
            :state="form"
            class="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start"
            @submit="onSubmit"
            @error="onFormError"
          >
            <!-- Date & time -->
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
                color="neutral"
                variant="subtle"
              />
            </UFormField>

            <!-- Medication (filtrado pelo bucket) -->
            <UFormField class="w-full" label="Medication" name="medId" required>
              <USelectMenu
                v-model="form.medId"
                :items="selectItems"
                value-key="value"
                placeholder="Select a medication..."
                class="w-full"
                color="neutral"
                variant="subtle"
              />
            </UFormField>

            <!-- Dose -->
            <UFormField class="w-full" label="Dose" name="dose" required>
              <UInputNumber
                v-model="form.dose"
                :min="0"
                class="w-full"
                color="neutral"
                variant="subtle"
              />
            </UFormField>

            <!-- Unit (auto do preset, mas editável) -->
            <UFormField class="w-full" label="Unit" name="unit" required>
              <UInput
                v-model="form.unit"
                class="w-full"
                color="neutral"
                variant="subtle"
              />
            </UFormField>

            <!-- Route (auto do preset, mas editável) -->
            <UFormField class="w-full" label="Route" name="route" required>
              <USelect
                v-model="form.route"
                :items="routeItems"
                value-key="value"
                class="w-full"
                color="neutral"
                variant="subtle"
              />
            </UFormField>

            <!-- Notes -->
            <UFormField class="w-full lg:col-span-5" label="Notes (optional)">
              <UTextarea
                v-model="form.notes"
                :rows="2"
                class="w-full"
                color="neutral"
                variant="subtle"
              />
            </UFormField>

            <div class="lg:col-span-5 flex justify-end">
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

        <!-- Listagem do dia (desktop tabela + mobile cards, como as outras telas) -->
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
            <!-- Desktop -->
            <div class="hidden md:block">
              <UTable :data="tableData" :columns="columns" class="mt-4">
                <template #notes-cell="{ row }">
                  <div class="flex items-center justify-center">
                    <UTooltip
                      v-if="row.original.notes"
                      :text="row.original.notes"
                    >
                      <UButton
                        variant="subtle"
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

            <!-- Mobile: cards -->
            <div class="md:hidden mt-4 space-y-3">
              <UCard v-for="item in tableData" :key="item.id" class="p-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="text-sm text-muted-foreground">
                      {{ formatDateTime(item.datetimeIso) }}
                    </div>
                    <div class="font-medium">{{ item.medLabel }}</div>

                    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div class="text-muted-foreground">Dose:</div>
                      <div class="font-medium">
                        {{ item.dose }} {{ item.unit }}
                      </div>

                      <div class="text-muted-foreground">Route:</div>
                      <div>{{ item.route }}</div>

                      <div class="text-muted-foreground">Class:</div>
                      <div>
                        <UBadge color="neutral" variant="subtle">
                          {{ item.class }}
                        </UBadge>
                      </div>

                      <div class="text-muted-foreground">Notes:</div>
                      <div>
                        <template v-if="item.notes">
                          <UPopover :popper="{ placement: 'top' }">
                            <UButton
                              variant="subtle"
                              color="neutral"
                              size="xs"
                              icon="i-lucide-message-square-text"
                              class="cursor-pointer"
                              aria-label="View notes"
                            />
                            <template #content>
                              <div class="max-w-[260px] text-sm p-2">
                                {{ item.notes }}
                              </div>
                            </template>
                          </UPopover>
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
              description="Confirm deletion of the selected record."
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
                    {{ pendingItem?.medLabel }}
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
import { shallowRef, ref, reactive, computed, watch } from "vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import * as z from "zod";
const toast = useToast();

// date
const df = new DateFormatter("en-US", { dateStyle: "medium" });
const now = new Date();
const viewDate = shallowRef(
  new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
);

// store
const m = useMedicationStore();

// buckets state
const buckets = m.buckets;
const activeBucket = ref("all");
const bucketPresets = computed(() => m.presetsByBucket(activeBucket.value));

// select items (filtrados por bucket)
const selectItems = computed(() =>
  bucketPresets.value.map((p) => ({ label: p.label, value: p.id }))
);

// route options
const routeItems = [
  { label: "Oral", value: "oral" },
  { label: "Subcutaneous", value: "subcutaneous" },
  { label: "Intravenous", value: "intravenous" },
];

// helpers
const pad2 = (n) => String(n).padStart(2, "0");
const toLocalDatetimeInput = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;

const calendarWithTime = (calendarDate, sourceDate = new Date()) => {
  if (!calendarDate) return sourceDate;
  const next = calendarDate.toDate(getLocalTimeZone());
  next.setHours(
    sourceDate.getHours(),
    sourceDate.getMinutes(),
    sourceDate.getSeconds(),
    sourceDate.getMilliseconds()
  );
  return next;
};

function formatDateTime(isoLike) {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  return d.toLocaleString();
}

// form
const form = reactive({
  datetimeIso: toLocalDatetimeInput(new Date()),
  medId: undefined,
  medLabel: "",
  class: "",
  route: "oral",
  dose: 0,
  unit: "mg",
  notes: "",
});

watch(viewDate, (calendarDate) => {
  if (!calendarDate) return;
  const base = form.datetimeIso ? new Date(form.datetimeIso) : new Date();
  form.datetimeIso = toLocalDatetimeInput(
    calendarWithTime(calendarDate, base)
  );
});

// aplica preset no form
function applyPreset(preset) {
  form.medId = preset.id;
  form.medLabel = preset.label;
  form.class = preset.class;
  form.route = preset.route;
  form.unit = preset.unit;
  form.dose = preset.defaultDose ?? 0;
}

// validação
const schema = z.object({
  datetimeIso: z.string().min(1, { message: "Date & time is required" }),
  medId: z.string().min(1, { message: "Medication is required" }),
  dose: z.coerce.number().positive({ message: "Dose must be > 0" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  route: z.string().min(1, { message: "Route is required" }),
  notes: z.string().optional(),
});

// tabela / cards
const dayRows = computed(() => m.logsForDate(viewDate.value.toString()));
const tableData = computed(() => dayRows.value);

// colunas desktop
const columns = [
  {
    accessorKey: "datetimeIso",
    header: "Date/Time",
    cell: ({ row }) => formatDateTime(row.original.datetimeIso),
  },
  { accessorKey: "medLabel", header: "Medication" },
  {
    accessorKey: "dose",
    header: "Dose",
    cell: ({ row }) => `${row.original.dose} ${row.original.unit}`,
  },
  { accessorKey: "route", header: "Route" },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) =>
      h("div", {}, [h("span", { class: "inline-flex" }, row.original.class)]),
  },
  { id: "notes", header: "Notes" },
  { id: "actions", header: "Actions" },
];

// submit
async function onSubmit() {
  // preencher campos derivados do preset selecionado (caso o usuário tenha escolhido via select)
  const p = m.presets.find((x) => x.id === form.medId);
  if (p) {
    form.medLabel = p.label;
    form.class = p.class;
    if (!form.unit) form.unit = p.unit;
    if (!form.route) form.route = p.route;
    if (!form.dose) form.dose = p.defaultDose ?? 0;
  }

  const payload = {
    date: viewDate.value.toString(),
    datetimeIso: form.datetimeIso,
    medId: form.medId,
    medLabel: form.medLabel,
    class: form.class,
    route: form.route,
    dose: form.dose,
    unit: form.unit,
    notes: form.notes,
  };

  const added = m.addLog(payload);

  toast.add({
    title: "Medication added",
    description: `${formatDateTime(payload.datetimeIso)} • ${
      payload.medLabel
    } • ${payload.dose} ${payload.unit}`,
    icon: "i-lucide-check",
    color: "success",
  });

  // reset mantendo bucket e hora atual
  form.datetimeIso = toLocalDatetimeInput(
    calendarWithTime(viewDate.value, new Date())
  );
  form.medId = undefined;
  form.medLabel = "";
  form.class = "";
  form.route = "oral";
  form.dose = 0;
  form.unit = "mg";
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

// delete modal
const confirmOpen = ref(false);
const pendingItem = ref(null);

function askDelete(item) {
  pendingItem.value = item;
  confirmOpen.value = true;
}
function confirmDelete() {
  const id = pendingItem.value?.id;
  if (!id) {
    confirmOpen.value = false;
    return;
  }
  const removed = pendingItem.value;
  m.deleteLog(id);
  toast.add({
    title: "Medication removed",
    description: `${formatDateTime(removed.datetimeIso)} • ${removed.medLabel}`,
    icon: "i-lucide-trash-2",
    color: "error",
  });
  confirmOpen.value = false;
  pendingItem.value = null;
}
</script>
