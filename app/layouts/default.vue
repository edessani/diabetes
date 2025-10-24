<script setup lang="ts">
import { useFoodStore } from "~/stores/food";
import type { NavigationMenuItem } from "@nuxt/ui";
/* --------- Stores --------- */
const food = useFoodStore();
const router = useRouter();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Food Intake",
    to: "/food-intake",
    icon: "i-lucide-pizza",
  },
  {
    label: "Glucose Level",
    to: "/glucose-level",
    icon: "i-lucide-boxes",
  },
  {
    label: "Medication Tracking",
    icon: "i-lucide-pill-bottle",
    to: "/medication-tracking",
  },
  {
    label: "Dashboard",
    icon: "i-lucide-chart-line",
    to: "/dashboard",
  },
]);

const isAuthenticated = computed(() => food.authStatus);

function onLogout() {
  food.authStatus = false;
  router.push("/");
}
</script>

<template>
  <UApp>
    <UMain class="flex min-h-screen flex-col">
      <UHeader v-if="isAuthenticated" mode="drawer">
        <template #title>
          <div class="flex items-center gap-2">
            <Logo class="h-6 w-auto" />
            <span class="text-lg font-semibold">GlycoCompass</span>
          </div>
        </template>

        <UNavigationMenu color="neutral" :items="items" />

        <template #right>
          <UColorModeButton />
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            @click="onLogout"
          />
          <!-- <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
            <UButton
              color="neutral"
              variant="ghost"
              to="https://github.com/nuxt/ui"
              target="_blank"
              icon="i-simple-icons-github"
              aria-label="GitHub"
            />
          </UTooltip> -->
        </template>

        <template #body>
          <UNavigationMenu
            color="neutral"
            :items="items"
            orientation="vertical"
            class="-mx-2.5"
          />
        </template>
      </UHeader>
      <div class="flex-1">
        <slot />
      </div>
      <UFooter v-if="isAuthenticated">
        <div class="text-sm">
          GlycoCompass · Developed by Yash Jhala
        </div>
      </UFooter>
    </UMain>
  </UApp>
</template>
