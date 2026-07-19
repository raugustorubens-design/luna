import assert from "node:assert/strict";
import test from "node:test";
import {
  convertTrainingToMemory,
  extractConcepts,
  extractProcedures,
  extractRelations,
} from "../training/training-to-memory";

const SAMPLE_TRAINING = `# Treinamento de Uso de EPI

- Capacete de segurança
- Óculos de proteção

O uso de Capacete de segurança é obrigatório em toda a planta, junto com Óculos de proteção nas áreas de risco.

1. Vestir o Capacete de segurança antes de entrar na planta.
2. Verificar os Óculos de proteção antes de iniciar a tarefa.
`;

test("extractConcepts pulls headings and bullet lines, deduplicated", () => {
  const concepts = extractConcepts(SAMPLE_TRAINING);
  assert.ok(concepts.includes("Treinamento de Uso de EPI"));
  assert.ok(concepts.includes("Capacete de segurança"));
  assert.ok(concepts.includes("Óculos de proteção"));
  assert.equal(concepts.length, new Set(concepts).size);
});

test("extractProcedures pulls numbered steps only", () => {
  const procedures = extractProcedures(SAMPLE_TRAINING);
  assert.equal(procedures.length, 2);
  assert.match(procedures[0]!, /Vestir o Capacete/);
});

test("extractRelations links concepts that co-occur in the same paragraph", () => {
  const concepts = extractConcepts(SAMPLE_TRAINING);
  const relations = extractRelations(SAMPLE_TRAINING, concepts);
  assert.ok(
    relations.some(
      (relation) =>
        (relation.from === "Capacete de segurança" && relation.to === "Óculos de proteção") ||
        (relation.from === "Óculos de proteção" && relation.to === "Capacete de segurança"),
    ),
  );
});

test("extractRelations returns nothing for fewer than two concepts", () => {
  assert.deepEqual(extractRelations("texto qualquer", ["único"]), []);
});

test("convertTrainingToMemory submits semantic and procedural knowledge and checkpoints, without a live database", async () => {
  const submitted: { knowledgeType: string }[] = [];
  let checkpointed: Record<string, unknown> | null = null;

  const result = await convertTrainingToMemory(
    { title: "Treinamento EPI", content: SAMPLE_TRAINING },
    {
      submitAsKnowledge: async (candidate) => {
        submitted.push({ knowledgeType: candidate.knowledgeType });
        return { action: "consolidate", reason: "test" };
      },
      checkpoint: async (summary) => {
        checkpointed = summary;
      },
    },
  );

  assert.ok(result.extraction.concepts.length > 0);
  assert.ok(result.extraction.procedures.length > 0);
  assert.ok(submitted.some((s) => s.knowledgeType === "semantica"));
  assert.ok(submitted.some((s) => s.knowledgeType === "procedimental"));
  assert.equal(result.decisions.semantica?.action, "consolidate");
  assert.ok(checkpointed !== null);
  assert.equal((checkpointed as Record<string, unknown>).kind, "training_to_memory");
});

test("convertTrainingToMemory skips procedural submission when there are no procedures", async () => {
  const submitted: string[] = [];

  const result = await convertTrainingToMemory(
    { title: "Treinamento sem passos", content: "# Só um conceito solto" },
    {
      submitAsKnowledge: async (candidate) => {
        submitted.push(candidate.knowledgeType);
        return { action: "consolidate", reason: "test" };
      },
      checkpoint: async () => {},
    },
  );

  assert.equal(result.extraction.procedures.length, 0);
  assert.ok(!submitted.includes("procedimental"));
});
