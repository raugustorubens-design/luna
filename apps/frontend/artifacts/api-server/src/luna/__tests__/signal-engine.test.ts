import assert from "node:assert/strict";
import test from "node:test";
import { computeMemorySignals, type MemoryObject } from "../signal-engine";

test("signal engine: brand new content with no existing memories is maximally novel and non-recurrent", () => {
  const candidate: MemoryObject = { key: "capital_brasil", content: "a capital do brasil é brasília" };

  const signals = computeMemorySignals(candidate, []);

  assert.equal(signals.relevance, 0);
  assert.equal(signals.novelty, 1);
  assert.equal(signals.recurrence, 0);
  assert.equal(signals.entropy, 0);
  assert.equal(signals.impact, 1);
  assert.equal(signals.outcome, 0);
  assert.equal(signals.explanation?.outcome, "OutcomeProvider não implementado");
});

test("signal engine: near-duplicate content against an existing memory has high relevance and low novelty", () => {
  const candidate: MemoryObject = { key: "capital_brasil", content: "a capital do brasil é brasília" };
  const existing: MemoryObject[] = [
    { key: "capital_brasil", content: "a capital do brasil é brasília", createdAt: "2026-07-20T00:00:00.000Z" },
  ];

  const signals = computeMemorySignals(candidate, existing);

  assert.equal(signals.relevance, 1);
  assert.equal(signals.novelty, 0);
  assert.equal(signals.impact, 0);
});

test("signal engine: outcome is always 0 with the documented explanation, regardless of input", () => {
  const signals = computeMemorySignals({ content: "qualquer coisa" }, [{ content: "outra coisa" }]);

  assert.equal(signals.outcome, 0);
  assert.equal(signals.explanation?.outcome, "OutcomeProvider não implementado");
});

test("signal engine: recurrence counts repeated similar memories, decayed by age", () => {
  const candidate: MemoryObject = {
    key: "deploy_railway",
    content: "deploy no railway falhou por timeout",
    createdAt: "2026-07-23T00:00:00.000Z",
  };
  const existing: MemoryObject[] = [
    { key: "deploy_railway", content: "deploy no railway falhou por timeout", createdAt: "2026-07-22T00:00:00.000Z" },
    { key: "deploy_railway", content: "deploy no railway falhou por timeout", createdAt: "2020-01-01T00:00:00.000Z" },
  ];

  const signals = computeMemorySignals(candidate, existing);

  // A one-day-old duplicate contributes more than a 6-year-old duplicate.
  const recentOnly = computeMemorySignals(candidate, [existing[0]!]);
  const oldOnly = computeMemorySignals(candidate, [existing[1]!]);

  assert.ok(recentOnly.recurrence > oldOnly.recurrence);
  assert.ok(signals.recurrence >= recentOnly.recurrence);
});

test("signal engine: entropy flags conflict for same-topic content with low lexical similarity", () => {
  const candidate: MemoryObject = { key: "provider_padrao", content: "o provider padrão da luna é o groq" };
  const existing: MemoryObject[] = [{ key: "provider_padrao", content: "o provider padrão da luna é o openai" }];

  const signals = computeMemorySignals(candidate, existing);

  assert.ok(signals.entropy > 0, "expected entropy to detect the conflicting claim");
  assert.match(signals.explanation?.entropy ?? "", /conflito/);
});

test("signal engine: entropy is 0 when there is no existing memory sharing the candidate's key", () => {
  const candidate: MemoryObject = { key: "novo_topico", content: "algo totalmente novo" };
  const existing: MemoryObject[] = [{ key: "outro_topico", content: "algo completamente diferente" }];

  const signals = computeMemorySignals(candidate, existing);

  assert.equal(signals.entropy, 0);
});

test("signal engine: entropy is 0 (not computable) when the candidate has no key", () => {
  const candidate: MemoryObject = { content: "sem identidade semântica" };
  const existing: MemoryObject[] = [{ key: "algo", content: "algo" }];

  const signals = computeMemorySignals(candidate, existing);

  assert.equal(signals.entropy, 0);
  assert.match(signals.explanation?.entropy ?? "", /não computável/);
});

test("signal engine: impact is documented as a provisional novelty proxy", () => {
  const signals = computeMemorySignals({ content: "x" }, []);

  assert.equal(signals.impact, signals.novelty);
  assert.match(signals.explanation?.impact ?? "", /provisório/);
});
