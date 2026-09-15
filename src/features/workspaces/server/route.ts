import { zValidator } from "@hono/zod-validator";
import { ID } from "node-appwrite";
import { Hono } from "hono";

import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, WORKSPACES_ID } from "@/config";

import { createWorkspaceSchema } from "../schemas";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const tablesDB = c.get("tablesDB");

    const workspaces = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: WORKSPACES_ID,
    });

    return c.json({ data: workspaces });
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const tablesDB = c.get("tablesDB");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        const mimeType = image.type || "application/octet-stream";

        uploadedImageUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
      }

      const workspace = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: WORKSPACES_ID,
        rowId: ID.unique(),
        data: {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
        },
      });
      return c.json({ data: workspace });
    },
  );

export default app;
