import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
    // We use the same base URL as the app
    baseURL: typeof window !== "undefined" ? window.location.origin : undefined
});
