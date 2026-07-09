"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

const shopFloorQueues = [
  { label: "Milling", detail: "Cut lists, sheet goods, machining, and parts readiness.", count: 6 },
  { label: "Construction", detail: "Cabinet boxes, face frames, assembly, and hardware staging.", count: 9 },
  { label: "Finish", detail: "Sanding, stain, paint, topcoat, and cure windows.", count: 4 },
  { label: "Install prep", detail: "Delivery packets, punch items, and jobsite readiness.", count: 3 }
];

type FloorTask = {
  id: string;
  job: string;
  station: string;
  owner: string;
  due: string;
  status: "Ready" | "In progress" | "Blocked";
};

const initialFloorTasks: FloorTask[] = [
  { id: "anderson-milling", job: "Anderson Kitchen", station: "Milling", owner: "Sam", due: "Today", status: "Ready" },
  { id: "harlow-construction", job: "Harlow Lot 18", station: "Construction", owner: "Marco", due: "Jun 17", status: "In progress" },
  { id: "ridgeline-finish", job: "Ridgeline Vanity", station: "Finish", owner: "Taylor", due: "Jun 18", status: "Blocked" }
];

const storageKey = "cabinet-shop.shop-floor.tasks";
const filters = ["Today", "Blocked", "Ready for handoff", "Install prep"] as const;

export function ShopFloorWorkspace() {
  const [tasks, setTasks] = useState(initialFloorTasks);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Today");
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    const storedTasks = window.localStorage.getItem(storageKey);

    if (storedTasks) {
      setTasks(JSON.parse(storedTasks) as FloorTask[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (activeFilter === "Today") {
          return task.due === "Today";
        }

        if (activeFilter === "Blocked") {
          return task.status === "Blocked";
        }

        if (activeFilter === "Ready for handoff") {
          return task.status === "Ready";
        }

        return task.station === "Install prep";
      }),
    [activeFilter, tasks]
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextTask: FloorTask = {
      id: `floor-${Date.now()}`,
      job: String(formData.get("job") ?? "").trim(),
      station: String(formData.get("station") ?? "Milling"),
      owner: String(formData.get("owner") ?? "").trim(),
      due: String(formData.get("due") ?? "").trim() || "Today",
      status: String(formData.get("status") ?? "Ready") as FloorTask["status"]
    };

    if (!nextTask.job || !nextTask.owner) {
      return;
    }

    setTasks((currentTasks) => [nextTask, ...currentTasks]);
    setActiveFilter(nextTask.due === "Today" ? "Today" : "Ready for handoff");
    setIsAddingTask(false);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader
        eyebrow="Labor"
        title="Shop Floor"
        description="Production-focused work outside the office: milling, construction, finish, delivery prep, and install readiness."
        action={
          <div className="header-actions">
            <button className="button secondary" onClick={() => window.print()} type="button">
              Print packet
            </button>
            <button className="button" onClick={() => setIsAddingTask((current) => !current)} type="button">
              Add floor task
            </button>
          </div>
        }
      />

      <section className="work-toolbar" aria-label="Shop floor filters">
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

      {isAddingTask ? (
        <form className="card inline-form" onSubmit={addTask}>
          <div className="field">
            <label htmlFor="floor-job">Job</label>
            <input id="floor-job" name="job" placeholder="Anderson Kitchen" required />
          </div>
          <div className="field">
            <label htmlFor="floor-station">Station</label>
            <select id="floor-station" name="station">
              <option>Milling</option>
              <option>Construction</option>
              <option>Finish</option>
              <option>Install prep</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="floor-owner">Owner</label>
            <input id="floor-owner" name="owner" placeholder="Sam" required />
          </div>
          <div className="field">
            <label htmlFor="floor-due">Due</label>
            <input id="floor-due" name="due" placeholder="Today" />
          </div>
          <div className="field">
            <label htmlFor="floor-status">Status</label>
            <select id="floor-status" name="status">
              <option>Ready</option>
              <option>In progress</option>
              <option>Blocked</option>
            </select>
          </div>
          <button className="button" type="submit">Save task</button>
        </form>
      ) : null}

      <section className="grid grid-2">
        {shopFloorQueues.map((queue) => (
          <article className="card" key={queue.label}>
            <p className="eyebrow">{queue.count} active</p>
            <h2>{queue.label}</h2>
            <p className="muted">{queue.detail}</p>
          </article>
        ))}
      </section>

      <section className="card work-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Queue</p>
            <h2>Floor assignments</h2>
          </div>
          <span className="status-pill ready">{filteredTasks.length} shown</span>
        </div>
        <table className="table responsive-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Station</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td data-label="Job">{task.job}</td>
                <td data-label="Station">{task.station}</td>
                <td data-label="Owner">{task.owner}</td>
                <td data-label="Due">{task.due}</td>
                <td data-label="Status">
                  <span className={task.status === "Blocked" ? "status-pill blocked" : "status-pill ready"}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTasks.length === 0 ? <p className="muted empty-state">No assignments match this filter.</p> : null}
      </section>
    </>
  );
}
