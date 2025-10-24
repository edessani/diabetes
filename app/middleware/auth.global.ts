import { useFoodStore } from "~/stores/food";

export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const food = useFoodStore();
  const publicPaths = new Set(["/", "/about"]);

  if (!food.authStatus && !publicPaths.has(to.path)) {
    return navigateTo("/");
  }

  if (food.authStatus && to.path === "/") {
    return navigateTo("/food-intake");
  }
});
