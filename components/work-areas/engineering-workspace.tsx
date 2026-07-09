"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

const engineeringWork = [
  { title: "Needs engineering", detail: "Approved design work waiting for shop drawings, cut lists, or CNC prep.", count: 4 },
  { title: "In review", detail: "Technical questions, hardware conflicts, and construction details to resolve.", count: 3 },
  { title: "Released to shop", detail: "Projects ready for milling and construction handoff.", count: 5 }
];

type ReleaseCheck = {
  id: string;
  item: string;
  done: boolean;
};

type EngineeringPackage = {
  id: string;
  project: string;
  package: string;
  due: string;
  owner: string;
  status: "Needs engineering" | "Cut lists" | "CNC ready" | "Released";
};

const initialReleaseChecklist: ReleaseCheck[] = [
  { id: "drawings", item: "Shop drawings checked", done: true },
  { id: "cut-list", item: "Cut list generated", done: true },
  { id: "hardware", item: "Hardware conflicts resolved", done: false },
  { id: "released", item: "Released to milling", done: false }
];

const initialEngineeringQueue: EngineeringPackage[] = [
  { id: "anderson-island", project: "Anderson Kitchen", package: "Island panel package", due: "Jun 14", owner: "Riley", status: "Needs engineering" },
  { id: "harlow-pantry", project: "Harlow Lot 18", package: "Tall pantry units", due: "Jun 16", owner: "Sam", status: "Cut lists" },
  { id: "nolan-drawers", project: "Nolan Vanity", package: "Drawer box layout", due: "Jun 17", owner: "Taylor", status: "CNC ready" }
];

const packageStorageKey = "cabinet-shop.engineering.packages";
const checklistStorageKey = "cabinet-shop.engineering.checklist";
const filters = ["Needs engineering", "Cut lists", "CNC ready", "Released"] as const;

export function EngineeringWorkspace() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [packages, setPackages] = useState(initialEngineeringQueue);
  const [checks, setChecks] = useState(initialReleaseChecklist);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Needs engineering");
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  useEffect(() => {
    const storedPackages = window.localStorage.getItem(packageStorageKey);
    const storedChecks = window.localStorage.getItem(checklistStorageKey);

    if (storedPackages) {
      setPackages(JSON.parse(storedPackages) as EngineeringPackage[]);
    }

    if (storedChecks) {
      setChecks(JSON.parse(storedChecks) as ReleaseCheck[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(packageStorageKey, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    window.localStorage.setItem(checklistStorageKey, JSON.stringify(checks));
  }, [checks]);

  const visiblePackages = useMemo(
    () => packages.filter((item) => item.status === activeFilter),
    [activeFilter, packages]
  );

  function addPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextPackage: EngineeringPackage = {
      id: `engineering-${Date.now()}`,
      project: String(formData.get("project") ?? "").trim(),
      package: String(formData.get("package") ?? "").trim(),
      due: String(formData.get("due") ?? "").trim(),
      owner: String(formData.get("owner") ?? "").trim(),
      status: String(formData.get("status") ?? "Needs engineering") as EngineeringPackage["status"]
    };

    if (!nextPackage.project || !nextPackage.package || !nextPackage.due || !nextPackage.owner) {
      return;
    }

    setPackages((currentPackages) => [nextPackage, ...currentPackages]);
    setActiveFilter(nextPackage.status);
    setIsAddingPackage(false);
    event.currentTarget.reset();
  }

  function uploadCutLists(files: FileList | null) {
    if (!files) {
      return;
    }

    const uploadedPackages = Array.from(files).map((file) => ({
      id: `cut-list-${file.name}-${Date.now()}`,
      project: "Uploaded cut list",
      package: file.name,
      due: "Review needed",
      owner: "Unassigned",
      status: "Cut lists" as const
    }));

    setPackages((currentPackages) => [...uploadedPackages, ...currentPackages]);
    setActiveFilter("Cut lists");
  }

  function toggleCheck(checkId: string) {
    setChecks((currentChecks) =>
      currentChecks.map((check) => (check.id === checkId ? { ...check, done: !check.done } : check))
    );
  }

  function releaseNextPackage() {
    setPackages((currentPackages) => {
      const nextPackage = currentPackages.find((item) => item.status !== "Released");

      if (!nextPackage) {
        return currentPackages;
      }

      return currentPackages.map((item) =>
        item.id === nextPackage.id ? { ...item, status: "Released" } : item
      );
    });
    setChecks((currentChecks) => currentChecks.map((check) => ({ ...check, done: true })));
    setActiveFilter("Released");
  }

  return (
    <>
      <PageHeader
        eyebrow="Shop prep"
        title="Engineering"
        description="In-shop engineering for technical review, shop drawings, cut lists, construction details, and production release."
        action={
          <div className="header-actions">
            <button className="button secondary" onClick={() => fileInputRef.current?.click()} type="button">
              Upload cut list
            </button>
            <button className="button secondary" onClick={() => setIsAddingPackage((current) => !current)} type="button">
              New package
            </button>
            <button className="button" onClick={releaseNextPackage} type="button">
              Release package
            </button>
            <input
              className="visually-hidden"
              multiple
              onChange={(event) => uploadCutLists(event.target.files)}
              ref={fileInputRef}
              type="file"
            />
          </div>
        }
      />

      <section className="work-toolbar" aria-label="Engineering filters">
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

      {isAddingPackage ? (
        <form className="card inline-form" onSubmit={addPackage}>
          <div className="field">
            <label htmlFor="engineering-project">Project</label>
            <input id="engineering-project" name="project" placeholder="Anderson Kitchen" required />
          </div>
          <div className="field">
            <label htmlFor="engineering-package">Package</label>
            <input id="engineering-package" name="package" placeholder="Island panels" required />
          </div>
          <div className="field">
            <label htmlFor="engineering-due">Due</label>
            <input id="engineering-due" name="due" placeholder="Jun 20" required />
          </div>
          <div className="field">
            <label htmlFor="engineering-owner">Owner</label>
            <input id="engineering-owner" name="owner" placeholder="Riley" required />
          </div>
          <div className="field">
            <label htmlFor="engineering-status">Status</label>
            <select id="engineering-status" name="status">
              <option>Needs engineering</option>
              <option>Cut lists</option>
              <option>CNC ready</option>
              <option>Released</option>
            </select>
          </div>
          <button className="button" type="submit">Save package</button>
        </form>
      ) : null}

      <section className="grid grid-3">
        {engineeringWork.map((item) => (
          <article className="card" key={item.title}>
            <div className="metric">{item.count}</div>
            <h2>{item.title}</h2>
            <p className="muted">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-2 work-section">
        <div className="card">
          <p className="eyebrow">Checklist</p>
          <h2>Release gate</h2>
          <div className="checklist">
            {checks.map((check) => (
              <label className="checklist-row" key={check.item}>
                <input checked={check.done} onChange={() => toggleCheck(check.id)} type="checkbox" />
                <span>{check.item}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="eyebrow">Queue</p>
          <h2>Engineering packages</h2>
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Package</th>
                <th>Due</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visiblePackages.map((item) => (
                <tr key={item.id}>
                  <td data-label="Project">{item.project}</td>
                  <td data-label="Package">{item.package}</td>
                  <td data-label="Due">{item.due}</td>
                  <td data-label="Owner">{item.owner}</td>
                  <td data-label="Status">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visiblePackages.length === 0 ? <p className="muted empty-state">No engineering packages match this filter.</p> : null}
        </div>
      </section>
    </>
  );
}
