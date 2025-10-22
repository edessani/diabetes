<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

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
</script>

<template>
  <UApp>
    <UHeader mode="drawer">
      <template #title>
        <Logo class="h-6 w-auto" />
      </template>

      <UNavigationMenu color="neutral" :items="items" />

      <template #right>
        <UColorModeButton />

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

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <UFooter />
  </UApp>
</template>
