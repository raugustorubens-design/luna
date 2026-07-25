import JSZip from "jszip";
import type { CanonicalDocument, CanonicalRecord, ParseResult, Parser } from "../contracts";

/**
 * Unlike generic DOCX/PDF (deliberately deferred — see registry.ts — for not
 * mapping cleanly onto the tabular Canonical Model without becoming a shallow
 * parser that fails silently), a presentation is already naturally segmented:
 * each slide is a discrete unit. So this maps without forcing anything: one
 * record per slide, columns ["slide", "texto"].
 *
 * PPTX is a zip containing one XML file per slide (ppt/slides/slideN.xml),
 * with text living in <a:t> elements. Extraction uses a plain regex over the
 * XML — same pragmatic spirit as the other parsers here: no full XML parser,
 * which would be over-engineering for what's actually extracted (running
 * text only, no formatting/position).
 */

function extrairTextoDoSlideXml(xml: string): string {
  // Each <a:t>...</a:t> is a "text run". Concatenate every run on the
  // slide, in the order it appears in the XML (approximate visual order).
  const matches = xml.matchAll(/<a:t>([^<]*)<\/a:t>/g);
  const textos: string[] = [];
  for (const m of matches) {
    const texto = m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    if (texto.trim()) textos.push(texto);
  }
  return textos.join(" ");
}

export class PptxParser implements Parser {
  readonly format = "pptx" as const;

  async parse(input: Buffer, sourceName: string): Promise<ParseResult> {
    const warnings: string[] = [];

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(input);
    } catch (error) {
      throw new Error(
        `Falha ao abrir o arquivo como PPTX (zip inválido): ${error instanceof Error ? error.message : "erro desconhecido"}`,
      );
    }

    // Slide file names follow the slideN.xml pattern, but alphabetical file
    // order (slide1, slide10, slide2, ...) isn't the real presentation
    // order — needs sorting numerically by the extracted N.
    const slideFiles = Object.keys(zip.files)
      .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml$/)![1], 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml$/)![1], 10);
        return numA - numB;
      });

    if (slideFiles.length === 0) {
      throw new Error(
        "Nenhum slide encontrado (ppt/slides/*.xml ausente) — o arquivo não parece ser um PPTX válido, ou está vazio.",
      );
    }

    const records: CanonicalRecord[] = [];
    for (let i = 0; i < slideFiles.length; i++) {
      const xml = await zip.files[slideFiles[i]].async("string");
      const texto = extrairTextoDoSlideXml(xml);
      if (!texto.trim()) {
        warnings.push(`Slide ${i + 1} não tem texto extraível (pode ser só imagem/gráfico).`);
      }
      records.push({
        fields: [
          { name: "slide", value: i + 1 },
          { name: "texto", value: texto || null },
        ],
      });
    }

    const document: CanonicalDocument = {
      title: sourceName,
      columns: ["slide", "texto"],
      records,
      metadata: {
        sourceFormat: "pptx",
        sourceName,
        parsedAt: new Date().toISOString(),
        recordCount: records.length,
      },
    };

    return { document, warnings };
  }
}
