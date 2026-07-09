"use client";

import { type DragEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

const designFiles = [
  { title: "Plans needing review", detail: "Drawings that need internal checks or client feedback.", count: 7 },
  { title: "Field measurements", detail: "Site dimensions, photos, and appliance specs to confirm.", count: 4 },
  { title: "Approved plan sets", detail: "Signed drawings ready to hand to engineering.", count: 6 }
];

type PlanReview = {
  id: string;
  project: string;
  file: string;
  reviewer: string;
  status: "Plan review" | "Measurements" | "Selections" | "Approved";
};

const initialPlanReviews: PlanReview[] = [
  { id: "anderson-revision", project: "Anderson Kitchen", file: "AK-revision-04.pdf", reviewer: "Taylor", status: "Plan review" },
  { id: "harlow-measurements", project: "Harlow Lot 18", file: "HL18-field-measurements.pdf", reviewer: "Mia", status: "Measurements" },
  { id: "ridgeline-approved", project: "Ridgeline Vanity", file: "RV-approved-plan-set.pdf", reviewer: "Jordan", status: "Approved" }
];

const storageKey = "cabinet-shop.design.plan-reviews";
const filters = ["Plan review", "Measurements", "Selections", "Approved"] as const;

export function DesignWorkspace() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState(initialPlanReviews);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Plan review");
  const [isAddingReview, setIsAddingReview] = useState(false);

  useEffect(() => {
    const storedReviews = window.localStorage.getItem(storageKey);

    if (storedReviews) {
      setReviews(JSON.parse(storedReviews) as PlanReview[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(reviews));
  }, [reviews]);

  const visibleReviews = useMemo(
    () => reviews.filter((review) => review.status === activeFilter),
    [activeFilter, reviews]
  );

  function addReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextReview: PlanReview = {
      id: `review-${Date.now()}`,
      project: String(formData.get("project") ?? "").trim(),
      file: String(formData.get("file") ?? "").trim(),
      reviewer: String(formData.get("reviewer") ?? "").trim(),
      status: String(formData.get("status") ?? "Plan review") as PlanReview["status"]
    };

    if (!nextReview.project || !nextReview.file || !nextReview.reviewer) {
      return;
    }

    setReviews((currentReviews) => [nextReview, ...currentReviews]);
    setActiveFilter(nextReview.status);
    setIsAddingReview(false);
    event.currentTarget.reset();
  }

  function addFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const uploadedReviews = Array.from(files).map((file) => ({
      id: `plan-${file.name}-${Date.now()}`,
      project: "Uploaded plan",
      file: file.name,
      reviewer: "Unassigned",
      status: activeFilter
    }));

    setReviews((currentReviews) => [...uploadedReviews, ...currentReviews]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  }

  return (
    <>
      <PageHeader
        eyebrow="Plans"
        title="Design"
        description="Design files, drawings, field measurements, plan revisions, and approval packets."
        action={
          <div className="header-actions">
            <button className="button secondary" onClick={() => fileInputRef.current?.click()} type="button">
              Upload plans
            </button>
            <button className="button" onClick={() => setIsAddingReview((current) => !current)} type="button">
              New review
            </button>
            <input
              className="visually-hidden"
              multiple
              onChange={(event) => addFiles(event.target.files)}
              ref={fileInputRef}
              type="file"
            />
          </div>
        }
      />

      <section className="work-toolbar" aria-label="Design filters">
        {filters.map((filter) => (
          <button
            className={filter === activeFilter ? "toolbar-chip active" : "toolbar-chip"}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      {isAddingReview ? (
        <form className="card inline-form" onSubmit={addReview}>
          <div className="field">
            <label htmlFor="review-project">Project</label>
            <input id="review-project" name="project" placeholder="Anderson Kitchen" required />
          </div>
          <div className="field">
            <label htmlFor="review-file">File</label>
            <input id="review-file" name="file" placeholder="AK-revision-05.pdf" required />
          </div>
          <div className="field">
            <label htmlFor="reviewer">Reviewer</label>
            <input id="reviewer" name="reviewer" placeholder="Taylor" required />
          </div>
          <div className="field">
            <label htmlFor="review-status">Status</label>
            <select id="review-status" name="status">
              <option>Plan review</option>
              <option>Measurements</option>
              <option>Selections</option>
              <option>Approved</option>
            </select>
          </div>
          <button className="button" type="submit">Save review</button>
        </form>
      ) : null}

      <section className="grid grid-3">
        {designFiles.map((item) => (
          <article className="card" key={item.title}>
            <div className="metric">{item.count}</div>
            <h2>{item.title}</h2>
            <p className="muted">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-2 work-section">
        <div className="card">
          <p className="eyebrow">Upload</p>
          <h2>Plan intake</h2>
          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
          >
            <strong>Drop drawings or measurements</strong>
            <span className="muted">PDF, photos, appliance specs, and signed approvals</span>
          </div>
        </div>
        <div className="card">
          <p className="eyebrow">Reviews</p>
          <h2>Active plan sets</h2>
          <div className="compact-list">
            {visibleReviews.map((review) => (
              <div className="compact-list-row" key={review.id}>
                <div>
                  <strong>{review.project}</strong>
                  <span className="muted">{review.file} - {review.reviewer}</span>
                </div>
                <span className="status-pill ready">{review.status}</span>
              </div>
            ))}
            {visibleReviews.length === 0 ? <p className="muted empty-state">No plan sets match this filter.</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
