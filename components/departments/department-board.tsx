import { departmentWorkflow } from "@/lib/constants/workflow";

export function DepartmentBoard() {
  return (
    <div className="grid grid-3">
      {departmentWorkflow.map((department, index) => (
        <section className="card" key={department.key}>
          <h3>{department.name}</h3>
          <p className="muted">{index % 4 === 0 ? "2 jobs waiting" : "1 job active"}</p>
          <span className={index === 2 || index === 11 ? "status-pill blocked" : "status-pill ready"}>
            {index === 2 || index === 11 ? "Review" : "Ready"}
          </span>
        </section>
      ))}
    </div>
  );
}

