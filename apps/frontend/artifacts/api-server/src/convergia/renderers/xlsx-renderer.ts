import ExcelJS from "exceljs";
import type { CanonicalDocument, Renderer, RenderResult, TemplateDescriptor } from "../contracts";

export class XlsxRenderer implements Renderer {
  readonly format = "xlsx" as const;

  async render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult> {
    const laidOut = template.layout(document);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(laidOut.title.slice(0, 31) || "Documento");

    worksheet.addRow(laidOut.columns);
    for (const record of laidOut.records) {
      worksheet.addRow(laidOut.columns.map((column) => record.fields.find((f) => f.name === column)?.value ?? null));
    }
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      format: "xlsx",
      filename: `${laidOut.title || "documento"}.xlsx`,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      content: Buffer.from(buffer),
    };
  }
}
