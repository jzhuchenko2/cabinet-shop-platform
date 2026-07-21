"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { ProjectFileActionState } from "@/app/(app)/projects/[projectId]/files/actions";

export type ProjectFileRow = {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  previewHref: string;
  downloadHref: string;
};

export type ProjectFileTypeOption = {
  value: string;
  label: string;
};

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Uploading..." : "Upload PDF"}
    </button>
  );
}

function RowButton({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className={danger ? "button danger" : "button secondary"} disabled={pending} type="submit">
      {pending ? "Saving..." : children}
    </button>
  );
}

export function ProjectFileManager({
  files,
  fileTypes,
  canManageFiles,
  uploadAction,
  updateAction,
  deleteAction
}: {
  files: ProjectFileRow[];
  fileTypes: ProjectFileTypeOption[];
  canManageFiles: boolean;
  uploadAction: (state: ProjectFileActionState, formData: FormData) => Promise<ProjectFileActionState>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [uploadState, uploadFormAction] = useFormState(uploadAction, {});
  const [selectedFile, setSelectedFile] = useState<ProjectFileRow | null>(null);

  return (
    <div className="grid">
      {canManageFiles ? (
        <form action={uploadFormAction} className="card form project-file-upload-form">
          <div className="field">
            <label htmlFor="file">PDF file</label>
            <input accept="application/pdf,.pdf" id="file" name="file" required type="file" />
          </div>
          <div className="field">
            <label htmlFor="name">Display name</label>
            <input id="name" name="name" placeholder="shop-drawings.pdf" />
          </div>
          <div className="field">
            <label htmlFor="fileType">Type</label>
            <select defaultValue="DOCUMENT" id="fileType" name="fileType">
              {fileTypes.map((fileType) => (
                <option key={fileType.value} value={fileType.value}>
                  {fileType.label}
                </option>
              ))}
            </select>
          </div>
          {uploadState.error ? <p className="form-error">{uploadState.error}</p> : null}
          {uploadState.message ? <p className="form-success">{uploadState.message}</p> : null}
          <UploadButton />
        </form>
      ) : null}

      <section className="card">
        {files.length === 0 ? (
          <p className="muted empty-state">No project PDFs have been uploaded yet.</p>
        ) : (
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Uploaded by</th>
                <th>Size</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td data-label="Name">
                    <div className="file-name-cell">
                      <button
                        aria-label={`Open ${file.name}`}
                        className="file-preview-button"
                        onClick={() => setSelectedFile(file)}
                        type="button"
                      >
                        <span className="file-preview" aria-hidden="true">
                          <iframe src={file.previewHref} title="" loading="lazy" />
                        </span>
                      </button>
                      <button className="file-name-button" onClick={() => setSelectedFile(file)} type="button">
                        <strong>{file.name}</strong>
                        <span>Open preview</span>
                      </button>
                    </div>
                  </td>
                  <td data-label="Type">{file.type}</td>
                  <td data-label="Uploaded by">{file.uploadedBy}</td>
                  <td data-label="Size">{file.size}</td>
                  <td data-label="Date">{file.uploadedAt}</td>
                  <td data-label="Actions">
                    <div className="file-actions">
                      <a className="button secondary" href={file.downloadHref}>
                        Download
                      </a>
                      {canManageFiles ? (
                        <>
                          <form action={updateAction} className="file-edit-form">
                            <input name="fileId" type="hidden" value={file.id} />
                            <input aria-label="File name" defaultValue={file.name} name="name" required />
                            <select aria-label="File type" defaultValue={file.type} name="fileType">
                              {fileTypes.map((fileType) => (
                                <option key={fileType.value} value={fileType.value}>
                                  {fileType.label}
                                </option>
                              ))}
                            </select>
                            <RowButton>Save</RowButton>
                          </form>
                          <form action={deleteAction}>
                            <input name="fileId" type="hidden" value={file.id} />
                            <RowButton danger>Delete</RowButton>
                          </form>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {selectedFile ? (
        <div className="modal-overlay" role="presentation">
          <div aria-labelledby="file-viewer-title" aria-modal="true" className="modal-panel file-viewer-modal" role="dialog">
            <div className="file-viewer-toolbar">
              <div>
                <p className="eyebrow">File preview</p>
                <h2 id="file-viewer-title">{selectedFile.name}</h2>
                <p className="muted">
                  {selectedFile.type} - {selectedFile.size} - Uploaded by {selectedFile.uploadedBy}
                </p>
              </div>
              <div className="file-viewer-actions">
                <a className="button secondary" href={selectedFile.downloadHref}>
                  Download
                </a>
                <button aria-label="Close file preview" className="icon-button" onClick={() => setSelectedFile(null)} type="button">
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={canManageFiles ? "file-viewer-grid" : "file-viewer-grid full"}>
              <iframe className="file-viewer-frame" src={selectedFile.previewHref} title={selectedFile.name} />

              {canManageFiles ? (
                <aside className="file-viewer-details">
                  <p className="eyebrow">File details</p>
                  <h3>Manager edits</h3>
                  <p className="muted">
                    Update the display name or document type here. Full PDF markup and page editing would need a dedicated annotation layer.
                  </p>
                  <form action={updateAction} className="form">
                    <input name="fileId" type="hidden" value={selectedFile.id} />
                    <div className="field">
                      <label htmlFor="viewer-file-name">Display name</label>
                      <input id="viewer-file-name" name="name" required defaultValue={selectedFile.name} />
                    </div>
                    <div className="field">
                      <label htmlFor="viewer-file-type">Type</label>
                      <select id="viewer-file-type" name="fileType" defaultValue={selectedFile.type}>
                        {fileTypes.map((fileType) => (
                          <option key={fileType.value} value={fileType.value}>
                            {fileType.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <RowButton>Save details</RowButton>
                  </form>
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
