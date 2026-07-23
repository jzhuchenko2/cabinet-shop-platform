import { PrismaClient } from "@prisma/client";
import { departmentWorkflow } from "../lib/constants/workflow";

const prisma = new PrismaClient();

const organizationId = "seed-organization";
const jobNumber = "MVP-001";

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "North Star Cabinet Co." },
    create: {
      id: organizationId,
      name: "North Star Cabinet Co."
    }
  });

  const departments = await Promise.all(
    departmentWorkflow.map((department, index) =>
      prisma.department.upsert({
        where: {
          organizationId_workflowKey: {
            organizationId: organization.id,
            workflowKey: department.key
          }
        },
        update: {
          name: department.name,
          sortOrder: index + 1,
          deadlineLabel: department.deadline,
          isActive: true
        },
        create: {
          organizationId: organization.id,
          name: department.name,
          workflowKey: department.key,
          sortOrder: index + 1,
          deadlineLabel: department.deadline,
          isActive: true
        }
      })
    )
  );

  const designDepartment = departments.find((department) => department.workflowKey === "DESIGN");
  const engineeringDepartment = departments.find((department) => department.workflowKey === "APPROVAL");
  const millingDepartment = departments.find((department) => department.workflowKey === "CUT_MILL");
  const constructionDepartment = departments.find((department) => department.workflowKey === "ASSEMBLY");

  if (!designDepartment || !engineeringDepartment || !millingDepartment || !constructionDepartment) {
    throw new Error("Required seed departments were not created.");
  }

  const owner = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      organizationId: organization.id,
      departmentId: designDepartment.id,
      name: "MVP Admin",
      role: "OWNER_ADMIN",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      departmentId: designDepartment.id,
      email: "admin@example.com",
      name: "MVP Admin",
      role: "OWNER_ADMIN"
    }
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {
      organizationId: organization.id,
      departmentId: designDepartment.id,
      name: "Morgan Manager",
      role: "MANAGER",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      departmentId: designDepartment.id,
      email: "manager@example.com",
      name: "Morgan Manager",
      role: "MANAGER"
    }
  });

  const designer = await prisma.user.upsert({
    where: { email: "taylor@example.com" },
    update: {
      organizationId: organization.id,
      departmentId: designDepartment.id,
      name: "Taylor Morgan",
      role: "DESIGNER",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      departmentId: designDepartment.id,
      email: "taylor@example.com",
      name: "Taylor Morgan",
      role: "DESIGNER"
    }
  });

  const purchaser = await prisma.user.upsert({
    where: { email: "riley@example.com" },
    update: {
      organizationId: organization.id,
      departmentId: engineeringDepartment.id,
      name: "Riley Chen",
      role: "PURCHASER",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      departmentId: engineeringDepartment.id,
      email: "riley@example.com",
      name: "Riley Chen",
      role: "PURCHASER"
    }
  });

  const shopLead = await prisma.user.upsert({
    where: { email: "sam@example.com" },
    update: {
      organizationId: organization.id,
      departmentId: millingDepartment.id,
      name: "Sam Rivera",
      role: "SHOP_LEAD",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      departmentId: millingDepartment.id,
      email: "sam@example.com",
      name: "Sam Rivera",
      role: "SHOP_LEAD"
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: "casey@example.com" },
    update: {
      organizationId: organization.id,
      departmentId: constructionDepartment.id,
      name: "Casey Worker",
      role: "DEPARTMENT_USER",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      departmentId: constructionDepartment.id,
      email: "casey@example.com",
      name: "Casey Worker",
      role: "DEPARTMENT_USER"
    }
  });

  await prisma.timeClockEntry.deleteMany({ where: { organizationId: organization.id } });

  const existingProject = await prisma.project.findUnique({
    where: {
      organizationId_jobNumber: {
        organizationId: organization.id,
        jobNumber
      }
    }
  });

  if (existingProject) {
    await prisma.notification.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.timeLog.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.file.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.photo.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.note.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.task.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.cabinetItem.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.area.deleteMany({ where: { projectId: existingProject.id } });
    await prisma.project.delete({ where: { id: existingProject.id } });
  }

  const client = await prisma.client.create({
    data: {
      organizationId: organization.id,
      name: "Anderson Residence",
      contactName: "Jordan Anderson",
      email: "jordan.anderson@example.com",
      phone: "555-0100",
      address: "1200 Oak Ridge Lane",
      notes: "Primary MVP sample client."
    }
  });

  const project = await prisma.project.create({
    data: {
      organizationId: organization.id,
      clientId: client.id,
      currentDepartmentId: designDepartment.id,
      name: "Anderson Kitchen",
      jobNumber,
      description: "Custom kitchen, island, pantry, and mudroom cabinet package.",
      status: "ACTIVE",
      priority: "HIGH",
      dueDate: new Date("2026-05-20T12:00:00.000Z"),
      installDate: new Date("2026-06-08T12:00:00.000Z")
    }
  });

  const kitchen = await prisma.area.create({
    data: {
      projectId: project.id,
      name: "Kitchen",
      description: "Main kitchen perimeter cabinets.",
      sortOrder: 1
    }
  });

  const island = await prisma.area.create({
    data: {
      projectId: project.id,
      name: "Island",
      description: "Island base cabinets and panels.",
      sortOrder: 2
    }
  });

  const sinkBase = await prisma.cabinetItem.create({
    data: {
      projectId: project.id,
      areaId: kitchen.id,
      name: "Sink base",
      itemNumber: "K-101",
      itemType: "BASE",
      status: "APPROVED",
      quantity: 1,
      width: "36",
      height: "34.5",
      depth: "24",
      material: "Maple plywood",
      finish: "Painted white",
      hardware: "Soft-close hinges and slides"
    }
  });

  const islandPanels = await prisma.cabinetItem.create({
    data: {
      projectId: project.id,
      areaId: island.id,
      name: "Island panel package",
      itemNumber: "I-201",
      itemType: "PANEL",
      status: "PLANNED",
      quantity: 4,
      width: "30",
      height: "34.5",
      depth: "0.75",
      material: "Maple plywood",
      finish: "Stained walnut"
    }
  });

  const drawingTask = await prisma.task.create({
    data: {
      projectId: project.id,
      areaId: kitchen.id,
      cabinetItemId: sinkBase.id,
      departmentId: designDepartment.id,
      assigneeId: designer.id,
      createdById: owner.id,
      title: "Finalize appliance panel dimensions",
      description: "Confirm refrigerator and dishwasher panel dimensions before approval.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date("2026-05-03T12:00:00.000Z")
    }
  });

  const approvalTask = await prisma.task.create({
    data: {
      projectId: project.id,
      areaId: island.id,
      cabinetItemId: islandPanels.id,
      departmentId: engineeringDepartment.id,
      assigneeId: owner.id,
      createdById: designer.id,
      title: "Approve finish sample",
      description: "Customer needs to approve final island stain sample.",
      status: "BLOCKED",
      priority: "URGENT",
      dueDate: new Date("2026-05-05T12:00:00.000Z"),
      isBlocked: true,
      blockedReason: "Waiting on customer approval."
    }
  });

  const assemblyTask = await prisma.task.create({
    data: {
      projectId: project.id,
      departmentId: constructionDepartment.id,
      assigneeId: purchaser.id,
      createdById: owner.id,
      title: "Stage drawer slide hardware",
      status: "READY",
      priority: "NORMAL",
      dueDate: new Date("2026-05-07T12:00:00.000Z")
    }
  });

  await prisma.task.create({
    data: {
      projectId: project.id,
      areaId: kitchen.id,
      cabinetItemId: sinkBase.id,
      departmentId: constructionDepartment.id,
      assigneeId: employee.id,
      createdById: manager.id,
      title: "Assemble sink base box",
      description: "Build and label the sink base box before finish handoff.",
      status: "READY",
      priority: "NORMAL",
      dueDate: new Date("2026-05-08T12:00:00.000Z")
    }
  });

  await prisma.note.createMany({
    data: [
      {
        projectId: project.id,
        areaId: kitchen.id,
        cabinetItemId: sinkBase.id,
        taskId: drawingTask.id,
        authorId: designer.id,
        noteType: "APPROVAL",
        body: "Customer approved shaker door profile, pending final finish sample."
      },
      {
        projectId: project.id,
        areaId: island.id,
        cabinetItemId: islandPanels.id,
        taskId: approvalTask.id,
        authorId: owner.id,
        noteType: "ISSUE",
        body: "Island finish sample is blocking purchasing handoff."
      }
    ]
  });

  await prisma.file.createMany({
    data: [
      {
        projectId: project.id,
        taskId: drawingTask.id,
        uploadedById: designer.id,
        name: "anderson-kitchen-drawings.pdf",
        storagePath: "projects/MVP-001/files/anderson-kitchen-drawings.pdf",
        mimeType: "application/pdf",
        sizeBytes: 428000,
        fileType: "DRAWING"
      },
      {
        projectId: project.id,
        taskId: approvalTask.id,
        uploadedById: owner.id,
        name: "signed-approval.pdf",
        storagePath: "projects/MVP-001/files/signed-approval.pdf",
        mimeType: "application/pdf",
        sizeBytes: 218000,
        fileType: "APPROVAL"
      }
    ]
  });

  await prisma.photo.createMany({
    data: [
      {
        projectId: project.id,
        areaId: kitchen.id,
        uploadedById: designer.id,
        caption: "Site measurement reference",
        storagePath: "projects/MVP-001/photos/site-measurement-reference.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 960000
      },
      {
        projectId: project.id,
        cabinetItemId: islandPanels.id,
        uploadedById: designer.id,
        caption: "Finish sample",
        storagePath: "projects/MVP-001/photos/finish-sample.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 720000
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: designer.id,
        projectId: project.id,
        type: "TASK_ASSIGNED",
        title: "Task assigned",
        body: "Finalize appliance panel dimensions"
      },
      {
        userId: owner.id,
        projectId: project.id,
        type: "TASK_BLOCKED",
        title: "Task blocked",
        body: "Finish sample approval is waiting on customer."
      }
    ]
  });

  await prisma.timeLog.createMany({
    data: [
      {
        userId: designer.id,
        projectId: project.id,
        departmentId: designDepartment.id,
        areaId: kitchen.id,
        cabinetItemId: sinkBase.id,
        taskId: drawingTask.id,
        minutes: 180,
        workDate: new Date("2026-04-28T12:00:00.000Z"),
        notes: "Drawing revisions."
      },
      {
        userId: shopLead.id,
        projectId: project.id,
        departmentId: millingDepartment.id,
        cabinetItemId: islandPanels.id,
        minutes: 240,
        workDate: new Date("2026-04-29T12:00:00.000Z"),
        notes: "Material prep."
      }
    ]
  });

  await prisma.timeClockEntry.create({
    data: {
      organizationId: organization.id,
      userId: employee.id,
      projectId: project.id,
      taskId: assemblyTask.id,
      startedAt: new Date("2026-07-08T15:30:00.000Z"),
      source: "MANUAL",
      notes: "Active demo time card for manager review.",
      verificationNote: "Future verification: shop Wi-Fi, QR/NFC, or geofence proximity."
    }
  });

  console.log(`Seeded ${organization.name} with sample project ${jobNumber}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
