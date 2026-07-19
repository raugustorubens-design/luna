import { Router, type IRouter } from "express";
import { buildOrganismContext } from "../luna/context-hub";

const router: IRouter = Router();

// Sibling to /chat, not a Gateway capability: `src/gateway/index.ts` has a
// tested constitution rule ("Gateway must not depend on the cognitive core,
// luna/*") — the same reason /chat lives here instead of in the Gateway
// registry. Context Hub follows that existing precedent rather than
// weakening an already-enforced boundary.
router.get("/context", async (_req, res): Promise<void> => {
  const context = await buildOrganismContext();
  res.json(context);
});

export default router;
