import { setupWorker } from "msw/browser";
import { handlers } from "@/test/handlers";

/** MSW worker for the browser — only started during e2e (see MockProvider). */
export const worker = setupWorker(...handlers);
