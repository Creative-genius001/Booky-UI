import { setupServer } from "msw/node";
import { handlers } from "@/test/handlers";

/** MSW server for the Node (Vitest) environment. */
export const server = setupServer(...handlers);
