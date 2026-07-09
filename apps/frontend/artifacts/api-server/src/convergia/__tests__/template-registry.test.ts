import assert from "node:assert/strict";
import test from "node:test";
import { createTemplateRegistry, TemplateRegistry } from "../templates/registry";
import { relatorioSsmaTabularTemplate } from "../templates/relatorio-ssma-tabular";

test("default registry includes the SSMA tabular template and one generic template per output format", () => {
  const registry = createTemplateRegistry();
  const ids = registry.list().map((t) => t.id);

  assert.ok(ids.includes("relatorio_ssma_tabular"));
  for (const format of ["csv", "json", "markdown", "html", "xlsx", "pptx"]) {
    assert.ok(ids.includes(`documento_tabular_generico_${format}`), `missing generic template for ${format}`);
  }
});

test("resolve() returns the highest version by default", () => {
  const registry = new TemplateRegistry();
  registry.register(relatorioSsmaTabularTemplate);
  registry.register({ ...relatorioSsmaTabularTemplate, version: 2 });

  const resolved = registry.resolve("relatorio_ssma_tabular");
  assert.equal(resolved.version, 2);
});

test("resolve() honors an explicit version", () => {
  const registry = new TemplateRegistry();
  registry.register(relatorioSsmaTabularTemplate);
  registry.register({ ...relatorioSsmaTabularTemplate, version: 2 });

  assert.equal(registry.resolve("relatorio_ssma_tabular", 1).version, 1);
});

test("registering the same id+version twice throws", () => {
  const registry = new TemplateRegistry();
  registry.register(relatorioSsmaTabularTemplate);
  assert.throws(() => registry.register(relatorioSsmaTabularTemplate), /já está registrado/);
});

test("resolving an unknown template throws", () => {
  const registry = new TemplateRegistry();
  assert.throws(() => registry.resolve("does_not_exist"), /não está registrado/);
});
