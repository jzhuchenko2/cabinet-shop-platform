import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { WorkflowSettings } from "@/components/settings/workflow-settings";
import { getCurrentUser } from "@/lib/auth";
import { departmentWorkflow } from "@/lib/constants/workflow";
import { listDepartmentSettings } from "@/lib/db/departments";
import { isFullAccess } from "@/lib/rbac";
import {
  addWorkflowDepartmentAction,
  moveWorkflowDepartmentAction,
  setWorkflowDepartmentActiveAction,
  updateWorkflowDepartmentAction
} from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !isFullAccess(currentUser)) {
    return <AccessDenied description="Settings are limited to managers and owners." />;
  }

  const departments = await listDepartmentSettings(currentUser.organizationId);

  return (
    <>
      <PageHeader eyebrow="Settings" title="Shop settings" />
      <WorkflowSettings
        activeAction={setWorkflowDepartmentActiveAction}
        addAction={addWorkflowDepartmentAction}
        departments={departments}
        moveAction={moveWorkflowDepartmentAction}
        updateAction={updateWorkflowDepartmentAction}
        workflowOptions={departmentWorkflow.map((department) => ({
          key: department.key,
          name: department.name,
          deadline: department.deadline
        }))}
      />
    </>
  );
}
