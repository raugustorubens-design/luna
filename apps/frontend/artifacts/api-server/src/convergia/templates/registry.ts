import type { TemplateDescriptor } from "../contracts";
import { relatorioSsmaTabularTemplate } from "./relatorio-ssma-tabular";
import { createGenericTabularTemplate, genericTabularFormats } from "./documento-tabular-generico";

export class TemplateRegistry {
  private readonly templates = new Map<string, Map<number, TemplateDescriptor>>();

  register(template: TemplateDescriptor): void {
    const versions = this.templates.get(template.id) ?? new Map<number, TemplateDescriptor>();
    if (versions.has(template.version)) {
      throw new Error(`Template "${template.id}" versão ${template.version} já está registrado.`);
    }
    versions.set(template.version, template);
    this.templates.set(template.id, versions);
  }

  resolve(id: string, version?: number): TemplateDescriptor {
    const versions = this.templates.get(id);
    if (!versions) {
      throw new Error(`Template "${id}" não está registrado.`);
    }
    if (version) {
      const template = versions.get(version);
      if (!template) throw new Error(`Template "${id}" versão ${version} não está registrada.`);
      return template;
    }
    return [...versions.values()].sort((a, b) => b.version - a.version)[0]!;
  }

  list(): TemplateDescriptor[] {
    return [...this.templates.values()]
      .flatMap((versions) => [...versions.values()])
      .sort((a, b) => a.id.localeCompare(b.id) || a.version - b.version);
  }
}

export function createTemplateRegistry(): TemplateRegistry {
  const registry = new TemplateRegistry();
  registry.register(relatorioSsmaTabularTemplate);
  for (const format of genericTabularFormats) {
    registry.register(createGenericTabularTemplate(format));
  }
  return registry;
}
