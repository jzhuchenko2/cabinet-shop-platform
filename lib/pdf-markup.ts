export type PdfPoint = {
  x: number;
  y: number;
};

export type PdfMarkupType = "arrow" | "highlight" | "pen" | "rect" | "text";

export type PdfMarkup = {
  id: string;
  page: number;
  type: PdfMarkupType;
  color: string;
  lineWidth: number;
  opacity: number;
  points?: PdfPoint[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
};

export type PdfPageRotations = Record<string, number>;
export type PdfDeletedPages = number[];

export type PdfMarkupDocument = {
  annotations: PdfMarkup[];
};

const markupTypes: PdfMarkupType[] = ["arrow", "highlight", "pen", "rect", "text"];

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeHexColor(value: unknown) {
  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  return "#f36f21";
}

export function parsePdfMarkupJson(value: unknown): PdfMarkupDocument {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const source = parsed && typeof parsed === "object" ? (parsed as { annotations?: unknown }) : {};
  const annotations = Array.isArray(source.annotations) ? source.annotations : [];

  return {
    annotations: annotations
      .map((annotation, index): PdfMarkup | null => {
        if (!annotation || typeof annotation !== "object") {
          return null;
        }

        const record = annotation as Record<string, unknown>;
        const type = markupTypes.includes(record.type as PdfMarkupType) ? (record.type as PdfMarkupType) : null;

        if (!type) {
          return null;
        }

        const points = Array.isArray(record.points)
          ? record.points
              .map((point) => {
                if (!point || typeof point !== "object") {
                  return null;
                }

                const pointRecord = point as Record<string, unknown>;
                return {
                  x: clampNumber(pointRecord.x, 0, 0, 1),
                  y: clampNumber(pointRecord.y, 0, 0, 1)
                };
              })
              .filter((point): point is PdfPoint => Boolean(point))
          : undefined;

        return {
          id: typeof record.id === "string" ? record.id : `markup-${index}`,
          page: Math.max(1, Math.round(clampNumber(record.page, 1, 1, 10000))),
          type,
          color: normalizeHexColor(record.color),
          lineWidth: clampNumber(record.lineWidth, 3, 1, 28),
          opacity: clampNumber(record.opacity, type === "highlight" ? 0.32 : 1, 0.1, 1),
          points,
          x: record.x === undefined ? undefined : clampNumber(record.x, 0, 0, 1),
          y: record.y === undefined ? undefined : clampNumber(record.y, 0, 0, 1),
          width: record.width === undefined ? undefined : clampNumber(record.width, 0, 0, 1),
          height: record.height === undefined ? undefined : clampNumber(record.height, 0, 0, 1),
          text: typeof record.text === "string" ? record.text.slice(0, 500) : undefined
        };
      })
      .filter((annotation): annotation is PdfMarkup => Boolean(annotation))
  };
}

export function parsePdfPageRotationsJson(value: unknown): PdfPageRotations {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const source = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};

  return Object.entries(source).reduce<PdfPageRotations>((rotations, [page, rotation]) => {
    const pageNumber = Number(page);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return rotations;
    }

    const normalizedRotation = ((Math.round(clampNumber(rotation, 0, -3600, 3600) / 90) * 90) % 360 + 360) % 360;

    if (normalizedRotation !== 0) {
      rotations[String(pageNumber)] = normalizedRotation;
    }

    return rotations;
  }, {});
}

export function parsePdfDeletedPagesJson(value: unknown): PdfDeletedPages {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const source = Array.isArray(parsed) ? parsed : [];

  return Array.from(
    new Set(
      source
        .map((page) => Number(page))
        .filter((page) => Number.isInteger(page) && page > 0 && page < 10000)
    )
  ).sort((a, b) => a - b);
}
