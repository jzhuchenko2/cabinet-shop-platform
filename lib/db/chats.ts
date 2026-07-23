import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

const chatUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  department: {
    select: {
      name: true
    }
  }
};

const participantInclude = {
  user: {
    select: chatUserSelect
  }
};

const conversationProjectSelect = {
  id: true,
  name: true,
  client: {
    select: {
      name: true
    }
  }
};

export async function listOrganizationChatUsers(user: CurrentUser) {
  return prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true,
      id: {
        not: user.id
      }
    },
    orderBy: {
      name: "asc"
    },
    select: chatUserSelect
  });
}

export async function listChatProjects(user: CurrentUser) {
  return prisma.project.findMany({
    where: {
      organizationId: user.organizationId,
      status: { not: "CANCELED" }
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: conversationProjectSelect
  });
}

export async function listUserConversations(user: CurrentUser) {
  const conversations = await prisma.conversation.findMany({
    where: {
      organizationId: user.organizationId,
      participants: {
        some: {
          userId: user.id
        }
      }
    },
    include: {
      participants: {
        include: participantInclude,
        orderBy: {
          user: {
            name: "asc"
          }
        }
      },
      messages: {
        include: {
          sender: {
            select: chatUserSelect
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      },
      project: {
        select: conversationProjectSelect
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return Promise.all(
    conversations.map(async (conversation) => {
      const currentParticipant = conversation.participants.find((participant) => participant.userId === user.id);
      const unreadCount = await prisma.chatMessage.count({
        where: {
          conversationId: conversation.id,
          senderId: {
            not: user.id
          },
          createdAt: {
            gt: currentParticipant?.lastReadAt ?? new Date(0)
          }
        }
      });

      return {
        ...conversation,
        unreadCount
      };
    })
  );
}

export async function getConversationForUser(conversationId: string, user: CurrentUser) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      organizationId: user.organizationId,
      participants: {
        some: {
          userId: user.id
        }
      }
    },
    include: {
      participants: {
        include: participantInclude,
        orderBy: {
          user: {
            name: "asc"
          }
        }
      },
      messages: {
        include: {
          sender: {
            select: chatUserSelect
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      project: {
        select: conversationProjectSelect
      }
    }
  });
}

export async function markConversationRead(conversationId: string, user: CurrentUser) {
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: user.id,
      conversation: {
        organizationId: user.organizationId
      }
    },
    data: {
      lastReadAt: new Date()
    }
  });
}

export async function createOrGetDirectConversation(user: CurrentUser, otherUserId: string) {
  if (otherUserId === user.id) {
    throw new Error("Choose another shop user to message.");
  }

  const otherUser = await prisma.user.findFirst({
    where: {
      id: otherUserId,
      organizationId: user.organizationId,
      isActive: true
    },
    select: {
      id: true
    }
  });

  if (!otherUser) {
    throw new Error("That user is not available for chat.");
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      organizationId: user.organizationId,
      type: "DIRECT",
      AND: [
        {
          participants: {
            some: {
              userId: user.id
            }
          }
        },
        {
          participants: {
            some: {
              userId: otherUserId
            }
          }
        }
      ]
    },
    select: {
      id: true
    }
  });

  if (existingConversation) {
    return existingConversation;
  }

  return prisma.conversation.create({
    data: {
      organizationId: user.organizationId,
      createdById: user.id,
      type: "DIRECT",
      participants: {
        create: [{ userId: user.id, lastReadAt: new Date() }, { userId: otherUserId }]
      }
    },
    select: {
      id: true
    }
  });
}

export async function createGroupConversation(user: CurrentUser, input: { title: string | null; participantIds: string[]; projectId?: string | null }) {
  const requestedProjectId = input.projectId?.trim() || null;
  const project = requestedProjectId
    ? await prisma.project.findFirst({
        where: {
          id: requestedProjectId,
          organizationId: user.organizationId,
          status: { not: "CANCELED" }
        },
        select: conversationProjectSelect
      })
    : null;
  const title = input.title?.trim() || (project ? `${project.name} project chat` : "");
  const requestedParticipantIds = Array.from(new Set(input.participantIds.filter((participantId) => participantId !== user.id)));

  if (!title) {
    throw new Error("Group name or project is required.");
  }

  if (requestedProjectId && !project) {
    throw new Error("Choose a valid project for this chat.");
  }

  if (requestedParticipantIds.length < 1) {
    throw new Error("Choose at least one teammate for the group.");
  }

  const availableUsers = await prisma.user.findMany({
    where: {
      id: {
        in: requestedParticipantIds
      },
      organizationId: user.organizationId,
      isActive: true
    },
    select: {
      id: true
    }
  });

  if (availableUsers.length !== requestedParticipantIds.length) {
    throw new Error("One or more selected users are not available for chat.");
  }

  return prisma.conversation.create({
    data: {
      organizationId: user.organizationId,
      createdById: user.id,
      projectId: project?.id ?? null,
      title,
      type: "GROUP",
      participants: {
        create: [{ userId: user.id, lastReadAt: new Date() }, ...availableUsers.map((selectedUser) => ({ userId: selectedUser.id }))]
      }
    },
    select: {
      id: true
    }
  });
}

export async function sendConversationMessage(user: CurrentUser, input: { conversationId: string; body: string }) {
  const body = input.body.trim();

  if (!body) {
    throw new Error("Message cannot be blank.");
  }

  if (body.length > 4000) {
    throw new Error("Message is too long.");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      organizationId: user.organizationId,
      participants: {
        some: {
          userId: user.id
        }
      }
    },
    include: {
      participants: {
        include: participantInclude
      }
    }
  });

  if (!conversation) {
    throw new Error("You cannot send messages in this conversation.");
  }

  const recipientIds = conversation.participants.map((participant) => participant.userId).filter((participantId) => participantId !== user.id);
  const notificationBody = body.length > 140 ? `${body.slice(0, 137)}...` : body;

  await prisma.$transaction(async (tx) => {
    await tx.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        body
      }
    });

    await tx.conversation.update({
      where: {
        id: conversation.id
      },
      data: {
        updatedAt: new Date()
      }
    });

    await tx.conversationParticipant.updateMany({
      where: {
        conversationId: conversation.id,
        userId: user.id
      },
      data: {
        lastReadAt: new Date()
      }
    });

    if (recipientIds.length > 0) {
      await tx.notification.createMany({
        data: recipientIds.map((recipientId) => ({
          userId: recipientId,
          type: "CHAT_MESSAGE",
          title: `New message from ${user.name}`,
          body: notificationBody
        }))
      });
    }
  });
}
