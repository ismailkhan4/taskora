import { zValidator } from "@hono/zod-validator";
import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { Hono } from "hono";

import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, WORKSPACES_ID } from "@/config";

import { createWorkspaceSchema } from "../schemas";

const app = new Hono().post(
  "/",
  zValidator("form", createWorkspaceSchema),
  sessionMiddleware,
  async (c) => {
    const tablesDB = c.get("tablesDB");
    const storage = c.get("storage");
    const user = c.get("user");

    const { name, image } = c.req.valid("form");

    let uploadedImageUrl: string | undefined;

    if (image instanceof File) {
      const file = await storage.createFile({
        bucketId: IMAGES_BUCKET_ID,
        fileId: ID.unique(),
        file: InputFile.fromBuffer(image, image.name),
      });

      try {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
        const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

        if (!endpoint || !project) {
          throw new Error("Appwrite storage configuration is missing.");
        }

        const viewUrl = new URL(
          `storage/buckets/${IMAGES_BUCKET_ID}/files/${file.$id}/view`,
          `${endpoint}/`,
        );
        viewUrl.searchParams.set("project", project);
        uploadedImageUrl = viewUrl.toString();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to process the workspace image.";

        return c.json({ error: message.trim() }, 403);
      }
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
