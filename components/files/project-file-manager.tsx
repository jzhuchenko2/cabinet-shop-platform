"use client";

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
                      <div className="file-preview" aria-hidden="true">
                        <iframe src={file.previewHref} title="" loading="lazy" />
                      </div>
                      <strong>{file.name}</strong>
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
    </div>
  );
}
