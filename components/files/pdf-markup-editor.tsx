"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { ProjectFileMarkupActionState } from "@/app/(app)/projects/[projectId]/files/actions";
import type { PdfDeletedPages, PdfMarkup, PdfMarkupDocument, PdfMarkupType, PdfPageRotations, PdfPoint } from "@/lib/pdf-markup";

type PdfEditorFile = {
  id: string;
  name: string;
  previewHref: string;
  markupJson: PdfMarkupDocument;
  pageRotations: PdfPageRotations;
  deletedPages: PdfDeletedPages;
};

type PdfMarkupEditorProps = {
  canManageFiles: boolean;
  exportMarkupAction: (state: ProjectFileMarkupActionState, formData: FormData) => Promise<ProjectFileMarkupActionState>;
  file: PdfEditorFile;
  saveMarkupAction: (state: ProjectFileMarkupActionState, formData: FormData) => Promise<ProjectFileMarkupActionState>;
};

type PdfDocProxy = {
  destroy?: () => Promise<void>;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { rotation?: number; scale: number }) => { height: number; width: number };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { height: number; width: number } }) => {
      cancel: () => void;
      promise: Promise<void>;
    };
  }>;
  numPages: number;
};

type DraftMarkup = PdfMarkup | null;

const tools: { key: PdfMarkupType; label: string }[] = [
  { key: "pen", label: "Pen" },
  { key: "highlight", label: "Highlight" },
  { key: "rect", label: "Box" },
  { key: "arrow", label: "Arrow" },
  { key: "text", label: "Text" }
];

function EditorActionButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button className="button secondary" disabled={pending} type="submit">
      {pending ? "Saving..." : children}
    </button>
  );
}

function getPointerPosition(event: React.PointerEvent<SVGSVGElement>): PdfPoint {
  const bounds = event.currentTarget.getBoundingClientRect();

  return {
    x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
    y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
  };
}

function createId() {
  return `markup-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeBox(start: PdfPoint, end: PdfPoint) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(start.x - end.x),
    height: Math.abs(start.y - end.y)
  };
}

function annotationToMarkup(annotation: PdfMarkup, pageSize: { width: number; height: number }) {
  const color = annotation.color;

  if ((annotation.type === "pen" || annotation.type === "arrow") && annotation.points && annotation.points.length > 0) {
    const points = annotation.points.map((point) => `${point.x * pageSize.width},${point.y * pageSize.height}`).join(" ");

    if (annotation.type === "arrow") {
      const start = annotation.points[0];
      const end = annotation.points[annotation.points.length - 1];

      return (
        <line
          key={annotation.id}
          markerEnd="url(#pdf-arrow-head)"
          opacity={annotation.opacity}
          stroke={color}
          strokeLinecap="round"
          strokeWidth={annotation.lineWidth}
          x1={start.x * pageSize.width}
          x2={end.x * pageSize.width}
          y1={start.y * pageSize.height}
          y2={end.y * pageSize.height}
        />
      );
    }

    return (
      <polyline
        fill="none"
        key={annotation.id}
        opacity={annotation.opacity}
        points={points}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={annotation.lineWidth}
      />
    );
  }

  if (annotation.type === "rect" || annotation.type === "highlight") {
    return (
      <rect
        fill={annotation.type === "highlight" ? color : "transparent"}
        height={(annotation.height ?? 0) * pageSize.height}
        key={annotation.id}
        opacity={annotation.opacity}
        stroke={annotation.type === "rect" ? color : "transparent"}
        strokeWidth={annotation.type === "rect" ? annotation.lineWidth : 0}
        width={(annotation.width ?? 0) * pageSize.width}
        x={(annotation.x ?? 0) * pageSize.width}
        y={(annotation.y ?? 0) * pageSize.height}
      />
    );
  }

  if (annotation.type === "text" && annotation.text) {
    return (
      <text
        fill={color}
        fontSize={Math.max(13, annotation.lineWidth * 4)}
        fontWeight="700"
        key={annotation.id}
        opacity={annotation.opacity}
        x={(annotation.x ?? 0) * pageSize.width}
        y={(annotation.y ?? 0) * pageSize.height}
      >
        {annotation.text}
      </text>
    );
  }

  return null;
}

export function PdfMarkupEditor({ canManageFiles, exportMarkupAction, file, saveMarkupAction }: PdfMarkupEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [saveState, saveFormAction] = useFormState(saveMarkupAction, {});
  const [exportState, exportFormAction] = useFormState(exportMarkupAction, {});
  const [pdfDoc, setPdfDoc] = useState<PdfDocProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 1, height: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<PdfMarkupType>("pen");
  const [color, setColor] = useState("#f36f21");
  const [lineWidth, setLineWidth] = useState(4);
  const [annotations, setAnnotations] = useState<PdfMarkup[]>(file.markupJson.annotations);
  const [pageRotations, setPageRotations] = useState<PdfPageRotations>(file.pageRotations);
  const [deletedPages, setDeletedPages] = useState<PdfDeletedPages>(file.deletedPages);
  const [draft, setDraft] = useState<DraftMarkup>(null);

  const visiblePages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1).filter((page) => !deletedPages.includes(page)),
    [deletedPages, pageCount]
  );
  const pageAnnotations = useMemo(
    () => annotations.filter((annotation) => annotation.page === pageNumber),
    [annotations, pageNumber]
  );
  const serializedMarkup = useMemo(() => JSON.stringify({ annotations }), [annotations]);
  const serializedRotations = useMemo(() => JSON.stringify(pageRotations), [pageRotations]);
  const serializedDeletedPages = useMemo(() => JSON.stringify(deletedPages), [deletedPages]);

  useEffect(() => {
    setAnnotations(file.markupJson.annotations);
    setPageRotations(file.pageRotations);
    setDeletedPages(file.deletedPages);
    setPageNumber(1);
  }, [file.id, file.markupJson, file.pageRotations, file.deletedPages]);

  useEffect(() => {
    let isActive = true;
    let loadedDoc: PdfDocProxy | null = null;

    async function loadPdf() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const pdfjs = await import("pdfjs-dist");
        const loadingTask = (pdfjs.getDocument as (source: unknown) => { promise: Promise<unknown> })({
          disableWorker: true,
          url: file.previewHref
        });
        loadedDoc = (await loadingTask.promise) as PdfDocProxy;

        if (!isActive) {
          await loadedDoc.destroy?.();
          return;
        }

        setPdfDoc(loadedDoc);
        setPageCount(loadedDoc.numPages);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "PDF could not be loaded.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isActive = false;
      if (loadedDoc) {
        void loadedDoc.destroy?.();
      }
    };
  }, [file.previewHref]);

  useEffect(() => {
    if (visiblePages.length > 0 && !visiblePages.includes(pageNumber)) {
      setPageNumber(visiblePages[0]);
    }
  }, [pageNumber, visiblePages]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || deletedPages.includes(pageNumber)) {
      return;
    }

    let isCancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    async function renderPage(document: PdfDocProxy) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.35, rotation: pageRotations[String(pageNumber)] ?? 0 });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context || isCancelled) {
        return;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      setPageSize({ width: viewport.width, height: viewport.height });
      renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;
    }

    renderPage(pdfDoc).catch((error) => {
      if (!isCancelled && error instanceof Error && error.name !== "RenderingCancelledException") {
        setLoadError(error.message);
      }
    });

    return () => {
      isCancelled = true;
      renderTask?.cancel();
    };
  }, [deletedPages, pageNumber, pageRotations, pdfDoc]);

  function startMarkup(event: React.PointerEvent<SVGSVGElement>) {
    if (!canManageFiles || deletedPages.includes(pageNumber)) {
      return;
    }

    const point = getPointerPosition(event);

    if (activeTool === "text") {
      const text = window.prompt("Text note");

      if (text?.trim()) {
        setAnnotations((current) => [
          ...current,
          {
            id: createId(),
            page: pageNumber,
            type: "text",
            color,
            lineWidth,
            opacity: 1,
            x: point.x,
            y: point.y,
            text: text.trim()
          }
        ]);
      }

      return;
    }

    const opacity = activeTool === "highlight" ? 0.32 : 1;

    if (activeTool === "pen" || activeTool === "arrow") {
      setDraft({
        id: createId(),
        page: pageNumber,
        type: activeTool,
        color,
        lineWidth,
        opacity,
        points: [point]
      });
      return;
    }

    setDraft({
      id: createId(),
      page: pageNumber,
      type: activeTool,
      color,
      lineWidth,
      opacity,
      points: [point],
      ...normalizeBox(point, point)
    });
  }

  function updateMarkup(event: React.PointerEvent<SVGSVGElement>) {
    if (!draft) {
      return;
    }

    const point = getPointerPosition(event);

    if ((draft.type === "pen" || draft.type === "arrow") && draft.points) {
      setDraft({
        ...draft,
        points: draft.type === "arrow" ? [draft.points[0], point] : [...draft.points, point]
      });
      return;
    }

    if (draft.x !== undefined && draft.y !== undefined) {
      const start = draft.points?.[0] ?? { x: draft.x, y: draft.y };
      setDraft({
        ...draft,
        ...normalizeBox(start, point)
      });
    }
  }

  function finishMarkup() {
    if (!draft) {
      return;
    }

    const hasUsefulShape =
      (draft.points && draft.points.length >= 2) ||
      ((draft.width ?? 0) > 0.006 && (draft.height ?? 0) > 0.006);

    if (hasUsefulShape) {
      setAnnotations((current) => [...current, draft]);
    }

    setDraft(null);
  }

  function rotatePage(direction: -1 | 1) {
    setPageRotations((current) => {
      const nextRotation = (((current[String(pageNumber)] ?? 0) + direction * 90) % 360 + 360) % 360;
      const next = { ...current };

      if (nextRotation === 0) {
        delete next[String(pageNumber)];
      } else {
        next[String(pageNumber)] = nextRotation;
      }

      return next;
    });
  }

  function deleteCurrentPage() {
    if (visiblePages.length <= 1) {
      return;
    }

    setDeletedPages((current) => Array.from(new Set([...current, pageNumber])).sort((a, b) => a - b));
    setAnnotations((current) => current.filter((annotation) => annotation.page !== pageNumber));
  }

  const feedback = saveState.message ?? exportState.message ?? saveState.error ?? exportState.error;
  const isError = Boolean(saveState.error ?? exportState.error);

  return (
    <div className="pdf-editor">
      <div className="pdf-editor-toolbar">
        <div className="pdf-editor-page-controls">
          <button className="button secondary" disabled={visiblePages.indexOf(pageNumber) <= 0} onClick={() => setPageNumber(visiblePages[Math.max(0, visiblePages.indexOf(pageNumber) - 1)])} type="button">
            Prev
          </button>
          <span>
            Page {pageNumber} of {pageCount || "..."}
          </span>
          <button
            className="button secondary"
            disabled={visiblePages.indexOf(pageNumber) === -1 || visiblePages.indexOf(pageNumber) >= visiblePages.length - 1}
            onClick={() => setPageNumber(visiblePages[Math.min(visiblePages.length - 1, visiblePages.indexOf(pageNumber) + 1)])}
            type="button"
          >
            Next
          </button>
        </div>

        {canManageFiles ? (
          <>
            <div className="pdf-editor-tool-group" aria-label="Markup tools">
              {tools.map((tool) => (
                <button
                  className={activeTool === tool.key ? "toolbar-chip active" : "toolbar-chip"}
                  key={tool.key}
                  onClick={() => setActiveTool(tool.key)}
                  type="button"
                >
                  {tool.label}
                </button>
              ))}
            </div>

            <div className="pdf-editor-tool-group">
              <input aria-label="Markup color" onChange={(event) => setColor(event.target.value)} type="color" value={color} />
              <input
                aria-label="Line width"
                max="14"
                min="1"
                onChange={(event) => setLineWidth(Number(event.target.value))}
                type="range"
                value={lineWidth}
              />
            </div>

            <div className="pdf-editor-tool-group">
              <button className="button secondary" onClick={() => rotatePage(-1)} type="button">
                Rotate left
              </button>
              <button className="button secondary" onClick={() => rotatePage(1)} type="button">
                Rotate right
              </button>
              <button className="button danger" disabled={visiblePages.length <= 1} onClick={deleteCurrentPage} type="button">
                Delete page
              </button>
            </div>

            <div className="pdf-editor-tool-group">
              <button className="button secondary" disabled={annotations.length === 0} onClick={() => setAnnotations((current) => current.slice(0, -1))} type="button">
                Undo
              </button>
              <button className="button secondary" disabled={pageAnnotations.length === 0} onClick={() => setAnnotations((current) => current.filter((annotation) => annotation.page !== pageNumber))} type="button">
                Clear page
              </button>
              <button className="button secondary" disabled={deletedPages.length === 0} onClick={() => setDeletedPages([])} type="button">
                Restore pages
              </button>
            </div>

            <form action={saveFormAction} className="pdf-editor-action-form">
              <input name="fileId" type="hidden" value={file.id} />
              <input name="markupJson" type="hidden" value={serializedMarkup} />
              <input name="pageRotations" type="hidden" value={serializedRotations} />
              <input name="deletedPages" type="hidden" value={serializedDeletedPages} />
              <EditorActionButton>Save markup</EditorActionButton>
            </form>
            <form action={exportFormAction} className="pdf-editor-action-form">
              <input name="fileId" type="hidden" value={file.id} />
              <input name="markupJson" type="hidden" value={serializedMarkup} />
              <input name="pageRotations" type="hidden" value={serializedRotations} />
              <input name="deletedPages" type="hidden" value={serializedDeletedPages} />
              <EditorActionButton>Export marked-up PDF</EditorActionButton>
            </form>
          </>
        ) : null}
      </div>

      {feedback ? <p className={isError ? "form-error" : "form-success"}>{feedback}</p> : null}

      <div className="pdf-editor-stage">
        {isLoading ? <p className="muted">Loading PDF...</p> : null}
        {loadError ? <p className="form-error">{loadError}</p> : null}
        {!isLoading && !loadError && deletedPages.includes(pageNumber) ? <p className="muted">This page is marked for deletion.</p> : null}
        <div className="pdf-page-surface">
          <canvas ref={canvasRef} />
          <svg
            className={canManageFiles ? "pdf-annotation-layer editable" : "pdf-annotation-layer"}
            height={pageSize.height}
            onPointerCancel={finishMarkup}
            onPointerDown={startMarkup}
            onPointerLeave={finishMarkup}
            onPointerMove={updateMarkup}
            onPointerUp={finishMarkup}
            viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
            width={pageSize.width}
          >
            <defs>
              <marker id="pdf-arrow-head" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                <path d="M0,0 L8,4 L0,8 z" fill={color} />
              </marker>
            </defs>
            {pageAnnotations.map((annotation) => annotationToMarkup(annotation, pageSize))}
            {draft ? annotationToMarkup(draft, pageSize) : null}
          </svg>
        </div>
      </div>
    </div>
  );
}
