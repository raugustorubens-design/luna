import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { ConvergiaPipeline } from "../convergia/pipeline";
import { ConvergiaValidationError } from "../convergia/errors";
import { submitAsKnowledge } from "../convergia/knowledge/knowledge-gate";
import { convertTrainingToMemory } from "../convergia/training/training-to-memory";
import { CORPORATE_DOCUMENT_CATALOG } from "../convergia/templates/corporate-catalog";
import type { ConvergiaInputFormat } from "../convergia/contracts";

const router: IRouter = Router();
const pipeline = new ConvergiaPipeline();

const upload = multer({ storage: multer.memoryStorage() });

const SUPPORTED_INPUT_FORMATS: ConvergiaInputFormat[] = ["xlsx", "csv", "json", "pptx"];

function resolveInputFormat(explicit: unknown, filename: string): ConvergiaInputFormat {
  const candidate = typeof explicit === "string" ? explicit.toLowerCase() : filename.split(".").pop()?.toLowerCase();
  if (SUPPORTED_INPUT_FORMATS.includes(candidate as ConvergiaInputFormat)) {
    return candidate as ConvergiaInputFormat;
  }
  throw new Error(
    `Formato de entrada "${candidate}" não é suportado nesta etapa. Suportados: ${SUPPORTED_INPUT_FORMATS.join(", ")}. DOCX e PDF estão no roadmap (ver relatório de implementação).`,
  );
}

router.get("/convergia/catalog", (_req, res) => {
  res.json({ documents: CORPORATE_DOCUMENT_CATALOG });
});

router.get("/convergia/templates", (_req, res) => {
  res.json({ templates: pipeline.listTemplates() });
});

router.post("/convergia/parse", upload.single("file"), async (req, res, next): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Arquivo é obrigatório no campo file." });
      return;
    }

    const inputFormat = resolveInputFormat(req.body?.format, req.file.originalname);
    const result = await pipeline.parseOnly(req.file.buffer, req.file.originalname, inputFormat);

    res.json({
      document: result.document,
      validation: result.validation,
      warnings: result.warnings,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/convergia/transform", upload.single("file"), async (req, res, next): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Arquivo é obrigatório no campo file." });
      return;
    }

    const inputFormat = resolveInputFormat(req.body?.format, req.file.originalname);
    const templateId = typeof req.body?.templateId === "string" ? req.body.templateId : undefined;
    if (!templateId) {
      res.status(400).json({ error: "templateId é obrigatório." });
      return;
    }

    const result = await pipeline.run({
      file: req.file.buffer,
      sourceName: req.file.originalname,
      inputFormat,
      templateId,
      templateVersion: req.body?.templateVersion ? Number(req.body.templateVersion) : undefined,
      transformId: typeof req.body?.transformId === "string" ? req.body.transformId : undefined,
    });

    if (req.body?.persistAsKnowledge === "true" || req.body?.persistAsKnowledge === true) {
      const knowledgeType = ["semantica", "procedimental", "inferencial"].includes(req.body?.knowledgeType)
        ? req.body.knowledgeType
        : "semantica";
      await submitAsKnowledge({
        document: result.canonicalDocument,
        knowledgeType,
        summary: `Documento transformado via template ${templateId}: ${result.canonicalDocument.metadata.recordCount} registro(s).`,
      });
    }

    res.setHeader("Content-Type", result.render.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.render.filename}"`);
    res.setHeader("X-Convergia-Warnings", JSON.stringify([...result.parseWarnings, ...result.transformNotes]));
    res.send(result.render.content);
  } catch (error) {
    next(error);
  }
});

router.post("/convergia/training", async (req, res, next): Promise<void> => {
  try {
    const { title, content } = req.body ?? {};
    if (typeof title !== "string" || typeof content !== "string" || title.trim() === "" || content.trim() === "") {
      res.status(400).json({ error: "title e content (texto do treinamento) são obrigatórios." });
      return;
    }

    const result = await convertTrainingToMemory({ title, content });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ConvergiaValidationError) {
    res.status(422).json({ error: error.message, issues: error.issues });
    return;
  }

  const message = error instanceof Error ? error.message : "Erro ao processar a solicitação do Convergia.";
  res.status(400).json({ error: message });
});

export default router;
