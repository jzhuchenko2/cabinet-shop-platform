export const departmentWorkflow = [
  { key: "SALES", name: "Sales" },
  { key: "DESIGN", name: "Design" },
  { key: "APPROVAL", name: "Approval" },
  { key: "SCHEDULING", name: "Scheduling" },
  { key: "PURCHASING", name: "Purchasing" },
  { key: "CUT_MILL", name: "Cut/Mill" },
  { key: "FACE_FRAME", name: "Face Frame" },
  { key: "ASSEMBLY", name: "Assembly" },
  { key: "SAND_PREP", name: "Sand/Prep" },
  { key: "FINISH", name: "Finish" },
  { key: "FINAL_ASSEMBLY", name: "Final Assembly" },
  { key: "QC", name: "QC" },
  { key: "DELIVERY", name: "Delivery" },
  { key: "INSTALL", name: "Install" },
  { key: "CLOSEOUT", name: "Closeout" }
] as const;

export type DepartmentWorkflowKey = (typeof departmentWorkflow)[number]["key"];

