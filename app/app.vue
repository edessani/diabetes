<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Dashboard",
    icon: "i-lucide-rocket",
    to: "/",
  },
  {
    label: "Food Intake",
    to: "/food-intake",
    icon: "i-lucide-book-open",
  },
  {
    label: "Glucose Level",
    to: "/glucose-level",
    icon: "i-lucide-box",
  },
  {
    label: "Medication Tracking",
    icon: "i-simple-icons-figma",
    to: "/medication-tracking",
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
