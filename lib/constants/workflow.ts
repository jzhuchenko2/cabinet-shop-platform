export const departmentWorkflow = [
  { key: "SALES", name: "Sales", deadline: "2 business days" },
  { key: "DESIGN", name: "Design", deadline: "5 business days" },
  { key: "APPROVAL", name: "Engineering", deadline: "3 business days" },
  { key: "CUT_MILL", name: "Milling", deadline: "2 business days" },
  { key: "ASSEMBLY", name: "Construction", deadline: "6 business days" },
  { key: "FINISH", name: "Finish", deadline: "4 business days" },
  { key: "DELIVERY", name: "Delivery", deadline: "1 business day" },
  { key: "INSTALL", name: "Install", deadline: "2 business days" }
] as const;

export type DepartmentWorkflowKey = (typeof departmentWorkflow)[number]["key"];
