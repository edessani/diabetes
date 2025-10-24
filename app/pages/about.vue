<template>
  <div class="min-h-screen flex items-center justify-center py-12">
    <UContainer class="w-full max-w-2xl">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">About GlycoCompass</h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              Academic diabetes tracker prototype
            </p>
          </div>
        </template>

        <div class="space-y-4 text-neutral-700 dark:text-neutral-200">
          <p>
            GlycoCompass was created for academic exploration of tracking food intake, glucose levels, and medication routines.
          </p>
          <p>
            Authenticated features are intentionally open for testing: any email and password combination that appears valid will allow you to sign in and browse the full dashboard experience.
          </p>
          <p>
            Feel free to experiment with the interface and data entry flows—the goal is to demonstrate concepts rather than enforce strict authentication.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton color="neutral" variant="subtle" @click="$router.back()">
              Go Back
            </UButton>
          </div>
        </template>
      </UCard>
    </UContainer>
  </div>
</template>
