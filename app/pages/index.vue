<template>
  <div class="min-h-screen flex items-center justify-center py-12">
    <UContainer class="w-full max-w-lg">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-2">
            <h1 class="text-2xl font-semibold">Welcome back to GlycoCompass</h1>
            <p class="text-sm">
              Access your diabetes tracker dashboard to monitor logs and insights.
            </p>
          </div>
        </template>

        <UForm
          :schema="schema"
          :state="form"
          class="space-y-4"
          @submit="onSubmit"
          @error="onFormError"
        >
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              color="neutral"
              variant="subtle"
              icon="i-lucide-mail"
            />
          </UFormField>

          <UFormField label="Password" name="password" required>
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              color="neutral"
              variant="subtle"
              :icon="showPassword ? 'i-lucide-lock-open' : 'i-lucide-lock'"
            >
              <template #trail>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="subtle"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-pressed="showPassword"
                  aria-label="Toggle password visibility"
                  @click.prevent="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <div class="flex items-center justify-between text-sm">
            <label class="inline-flex items-center gap-2">
              <UCheckbox v-model="form.remember" color="neutral"  />
              Remember me
            </label>
            <ULink 
              to="/about"
              class="text-neutral-700  transition-colors"
            >
              Forgot password?
            </ULink>
          </div>

          <UButton
            type="submit"
            color="neutral"
            variant="subtle"
            block
            class="mt-6"
            :loading="isSubmitting"
          >
            Sign in
          </UButton>
        </UForm>

        <template #footer>
          <div class="text-sm text-center">
            Don't have an account?
            <ULink to="/about" class="text-neutral-700 font-medium transition-colors">
              Create one
            </ULink>
          </div>
          <!-- {{ food.authStatus }} -->
        </template>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import * as z from "zod";

import { useFoodStore } from "~/stores/food";


/* --------- Stores --------- */
const food = useFoodStore();


definePageMeta({
  title: "Sign In",
});

const router = useRouter();
const toast = useToast();

const schema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Enter a valid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().optional(),
});

const form = reactive({
  email: "",
  password: "",
  remember: false,
});

const isSubmitting = ref(false);
const showPassword = ref(false);

async function onSubmit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.add({
      title: "Signed in",
      description: "Redirecting to your dashboard...",
      icon: "i-lucide-log-in",
      color: "success",
    });
    food.authStatus = true
    await router.push("/food-intake");
  } catch (error) {
    toast.add({
      title: "Sign-in failed",
      description:
        error?.message || "An unexpected error occurred. Please try again.",
      icon: "i-lucide-alert-triangle",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
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
