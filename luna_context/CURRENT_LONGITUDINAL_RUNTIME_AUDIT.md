# CURRENT LONGITUDINAL RUNTIME AUDIT
Date: 2026-05-27
Scope audited: repository root with foco em runtime soberano (`apps/frontend/artifacts/api-server`) e frontend soberano (`apps/frontend/artifacts/frontend`).

## 1) CURRENT REPOSITORY TOPOLOGY

### 1.1 Runtime topology real

- **CORE backend (operacional)**: `apps/frontend/artifacts/api-server`
  - HTTP app: Express + pino + CORS (`src/app.ts`)
  - Entrypoint: `src/index.ts`
  - API routes: `src/routes/chat.ts`, `src/routes/health.ts`
  - Cognitive nucleus: `src/luna/{pipeline.ts,memory.ts,context.ts,provider.ts}`
  - Memory persistence (Supabase JS): `src/lib/supabase.ts`
- **Frontend soberano (operacional parcial)**: `apps/frontend/artifacts/frontend`
  - App shell + routing pages: `src/pages/home.tsx`, `src/pages/dashboard.tsx`, `src/pages/chat.tsx`
  - Also contains a second chat implementation (`src/components/Chat.jsx`) and test-like `src/App.tsx` endpoint caller.
- **Adapters/legacy/experimental runtimes (presentes)**
  - `apps/api/main.py` (FastAPI adapter)
  - `apps/api/server.js` (legacy Node runtime)
  - `apps/core/main.py` (experimental API)

### 1.2 Request lifecycle (runtime soberano)

1. Client calls `POST /api/chat`.
2. `chat.ts` validates body with `SendMessageBody` (Zod via `@workspace/api-zod`).
3. Conversation is created or reused in Postgres (`conversationsTable` / Drizzle).
4. User message is persisted in `messages`.
5. `runLunaPipeline(content)` is executed.
6. Pipeline retrieves memory (`retrieveMemory` from Supabase table `memoria_luna`).
7. Context is built (`buildContext`) as plain object `{memories, current_message}`.
8. `ProviderRouter` selects Groq provider and executes completion via `fetch`.
9. Pipeline stores interaction memory in `memoria_luna`.
10. Assistant reply is persisted in `messagesTable` and returned.

### 1.3 Memory lifecycle (real)

- Retrieve: `retrieveMemory()` ignores semantic query and returns last 10 records ordered by `criado_em` desc.
- Context: memory is injected as serialized JSON into a system message.
- Persist: `storeMemory()` inserts a single interaction record with `user_message` + `assistant_response`.
- No embedding indexing, salience scoring, clustering, graph links, or reflective layers found in runtime soberano.

### 1.4 Observability/telemetry current state

- Basic HTTP logs exist (pino-http) and console logs inside pipeline/provider.
- No structured cognitive tracing IDs across extract/retrieve/build/route/execute/persist stages.
- No metrics endpoint for cognitive KPIs (coherence/entropy/salience/etc.).
- Dashboard frontend consumes `https://strong-celebration-production.up.railway.app/dashboard` directly, creating split observability and runtime coupling risk.

### 1.5 luna_context longitudinal infra status

- Root `luna_context` exists.
- `RUNTIME_STATE.md` populated (dated 2026-05-11).
- `ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md` at root are empty.
- Duplicate `luna_context` exists under API server, but core files there are also empty.

## 2) LONGITUDINAL EVOLUTION PHASE GRAPH

| System | Phase | Completion | Operational maturity | Architectural coherence |
|---|---:|---:|---|---|
| Memory System | 🌔 | 40% | Read/write works, retrieval is shallow | Medium-low |
| LunaContext | 🌓 | 30% | Directory exists, low maintained content | Medium-low |
| SLP | 🌒 | 10% | Only interaction persistence resembles primitive SLP | Low |
| CGM | 🌑 | 0% | No cognitive graph model module found | N/A |
| Reflection | 🌒 | 10% | No reflection pipeline, only logs | Low |
| ACH | 🌑 | 0% | Not implemented in runtime files | N/A |
| CIS | 🌑 | 0% | Not implemented in runtime files | N/A |
| Sensor Layer | 🌑 | 0% | No voice/OCR/DOM/AST ingestion pipeline | N/A |
| Multimodal Pipeline | 🌑 | 0% | No media pipeline in core runtime | N/A |
| Voice Interaction | 🌒 | 10% | UI intent exists but no backend voice stack | Low |
| Dev Mode | 🌓 | 35% | Dashboard and logs exist, no deep introspection | Medium-low |
| Cognitive Observability | 🌓 | 25% | UI cards + basic logs, no cognitive metrics backend | Low |
| Frontend Meet | 🌓 | 35% | Visual shell present; perception runtime missing | Medium-low |
| Frontend Dev | 🌔 | 45% | Conversation + dashboard working directionally | Medium |
| Cognitive Dashboard | 🌓 | 30% | Partial UI, depends on external endpoint | Low |
| Geometric Cognition | 🌑 | 0% | No geometric cognition runtime modules | N/A |
| Runtime Organism | 🌓 | 40% | Single loop works; continuity/observability incomplete | Medium-low |

## 3) IMPLEMENTATION STATUS (BY CAPABILITY)

- **memory/retrieval**: operational but text-log centric; query semantics absent.
- **embeddings**: absent in sovereign runtime.
- **persistence**: present in two stores (Postgres messages + Supabase memoria_luna), increasing duplication risk.
- **signal extraction/salience**: absent.
- **context building**: minimal object concatenation only.
- **graph association**: absent.
- **reflection**: absent as subsystem.
- **trust/security**: schema validation exists for API body, but no trust scoring/risk layers.
- **routing**: provider router exists but single-provider fixed (Groq).
- **telemetry/observability**: basic infra logs; no cognitive timeline traces.
- **multimodal readiness**: not implemented.

## 4) DEV MODE READINESS

### Objective answer
**Can DEV MODE run meaningfully now?**
- **Partially** (for API/chat troubleshooting and basic memory counters),
- **Not yet** for cognitive introspection (layer tracing, memory reasoning visibility, graph/reflection diagnostics).

### Minimum viable path (next)
1. Add pipeline stage trace envelope (requestId + stage timings) inside `runLunaPipeline`.
2. Persist trace rows (or JSON log stream) for `extractSignals/retrieveMemory/buildContext/routeProvider/executeProvider/persistInteraction`.
3. Expose `/api/dev/traces` and `/api/dev/memory` endpoints from sovereign backend (not external Railway dependency).
4. Rewire dashboard to consume sovereign backend only.
5. Add red/green health cards for provider latency, memory write success, and retrieval freshness.

## 5) SENSOR LAYER STATUS

Readiness summary:
- Voice interaction: **not operational** (no STT service integration in core).
- Speech-to-text: **missing**.
- OCR: **missing**.
- DOM analysis: **missing**.
- AST parsing: **missing**.
- Visual perception/media cognition: **missing**.
- Semantic reconstruction: **missing as pipeline stage**.

Conclusion: sensor layer is conceptual only.

## 6) MULTIMODAL PIPELINE

### Exists
- No sovereign modules for media ingestion/transcoding/segmentation.

### Missing
- Upload/storage contracts for media inputs.
- Audio extraction worker.
- STT adapter stage.
- Visual frame sampling and classifier stage.
- Signal compaction/denoising policy before memory persistence.
- Observability metrics by media stage.

### Fastest viable implementation (architecturally fit)
1. Add `extractSignals` stage with typed payloads (`text|audio|image|video`).
2. Implement **audio-only first** path:
   - input audio -> STT -> signal summarization -> persist compact SLP entry.
3. Keep raw media optional/ephemeral; persist only compressed semantic artifacts + references.
4. Emit per-stage metrics for DEV mode traceability.

## 7) MEMORY STATUS

- Current memory model: interaction records in `memoria_luna` plus chat history in `messages`.
- Persistence strategy: dual-store without explicit canonical ownership.
- Retrieval quality: recency-only (top 10), no semantic relevance ranking.
- Redundancy: high risk (assistant and user text repeated across stores).
- Contextual continuity: basic, with recent memory dump into system prompt.
- Layering/reconstruction: not implemented.
- Graph cognition/signal abstraction: not implemented.
- SLP behavior: only primitive approximation through interaction persistence.

## 8) FRONTEND ALIGNMENT

- Visual direction (dark palette, glow, system aesthetic) is present in both `home/dashboard/chat`.
- Identity split persists:
  - Some files suggest DEV terminal aesthetic.
  - `src/components/Chat.jsx` and `src/App.tsx` indicate parallel/inconsistent chat pathways.
- Meet vs Dev separation is not explicit at runtime route/app boundary.

Next visual evolution step:
- Enforce two intentional surfaces:
  - MEET: perceptual/orb-first minimal interface.
  - DEV: introspection timeline, memory trace explorer, provider and stage telemetry.

## 9) COGNITIVE OBSERVABILITY

Readiness for true cognitive dashboard: **low-to-medium**.

What exists:
- UI space for dashboard.
- Some memory counters from external backend.

What is missing:
- coherence/continuity/salience/entropy/trust metrics computation.
- graph density and memory pressure indicators.
- reflection activity indicators.
- homeostasis state machine.

## 10) OVERENGINEERING ANALYSIS

Detected issues:
- **Runtime multiplicity drift**: core + adapter + legacy + experimental active in tree.
- **Parallel frontend/chat implementations**: `src/App.tsx` and component chat paths can conflict with official routing narrative.
- **Spec/runtime divergence risk**: contract is defined in OpenAPI but some runtime paths and external dashboard dependencies bypass unified sovereignty.
- **Premature layering risk**: multiple runtime stacks before consolidating single cognitive traceable loop.

Not detected:
- unnecessary microservices explosion (still monolithic apps).
- fake distributed multi-agent runtime (not present in code).

## 11) NEXT CORRECT PHASE

### Phase name
**CONSOLIDATE FIRST EXECUTABLE COGNITIVE LOOP + DEV TRACE CORE**

### Build next (strict order)
1. Canonicalize one runtime path: sovereign TS backend as single cognitive authority.
2. Implement official cognitive stages in code (including missing `extractSignals`) with typed stage outputs.
3. Add first-class observability for each stage (timings, input/output summaries, failures).
4. Normalize memory ownership (define canonical store + retention policy).
5. Build DEV mode endpoints and wire dashboard locally.
6. Only after above, start sensor layer with audio-first ingestion.

### Postpone
- advanced multimodal video cognition,
- graph cognition expansion,
- geometric cognition,
- multi-provider orchestration complexity,
- distributed/multi-agent abstractions.

## 12) FINAL DIAGNOSIS

1. **Architecture coherent?** Partially coherent: sovereign path is clear on paper; implementation still fragmented.
2. **Implementation aligned with vision?** Partially aligned: first cognitive chat loop exists, but introspective/longitudinal requirements are not yet operational.
3. **Biggest gap?** Missing cognitive observability + structured memory semantics (beyond text logs).
4. **Build NEXT?** Stage-traced pipeline + DEV endpoints + canonical memory strategy.
5. **Postpone?** High-complexity multimodal and graph expansions until core loop observability is stable.
6. **Distance to first operational organism state?** Approx. **40-50%**: loop executes, but continuity, introspection, and sensory cognition are not yet production-real.

---

## Alignment note for existing luna_context files

- `RUNTIME_STATE.md`: still directionally useful, but date-locked to 2026-05-11 and now partially outdated (some blockers changed scope).
- `ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md`: currently empty and should be repopulated to avoid continuity loss.
- New file created by this audit: `CURRENT_LONGITUDINAL_RUNTIME_AUDIT.md` (this document).
