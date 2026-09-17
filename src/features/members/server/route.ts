import { z } from "zod";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createAdminClient } from "@/lib/appwrite";
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { MemberRole } from "../types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      }),
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const tablesDB = c.get("tablesDB");
      const user = c.get("user");

      const { workspaceId } = c.req.valid("query");

    const member = await getMember({
      tablesDB,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const members = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: MEMBERS_ID,
      queries: [Query.equal("workspaceId", workspaceId)],
    });

    const populatedMembers = await Promise.all(
      members.rows.map(async (member) => {
        const user = await users.get(member.userId);

        return {
          ...member,
          name: user.name,
          email: user.email,
        };
      }),
    );
    return c.json({
      data: {
        ...members,
        rows: populatedMembers,
      },
    });
  })
  .delete("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");
    const tablesDB = c.get("tablesDB");

    const memberToDelete = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: MEMBERS_ID,
      rowId: memberId,
    });

    const allMembersInWorkspace = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: MEMBERS_ID,
      queries: [Query.equal("workspaceId", memberToDelete.workspaceId)],
    });

    const member = await getMember({
      tablesDB: tablesDB,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (
      member.$id !== memberToDelete.$id &&
      memberToDelete.role !== MemberRole.ADMIN
    ) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: MEMBERS_ID,
      rowId: memberId,
    });

    return c.json({ data: { $id: memberToDelete.$id } });
  })
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.enum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const tablesDB = c.get("tablesDB");

      const memberToUpdate = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: MEMBERS_ID,
        rowId: memberId,
      });

      const allMembersInWorkspace = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: MEMBERS_ID,
        queries: [Query.equal("workspaceId", memberToUpdate.workspaceId)],
      });

      const member = await getMember({
        tablesDB: tablesDB,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade the only member" }, 400);
      }

      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: MEMBERS_ID,
        rowId: memberId,
        data: {
          role,
        },
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    },
  );

export default app;
