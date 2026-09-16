import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { UpdateWorkspaceForm } from "@/features/workspaces/components/update-workspace-form";
import { getWorkspace } from "@/features/workspaces/queries";

interface WorkspaceIdSettingPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

const WorkspaceIdSettingPage = async ({
  params,
}: WorkspaceIdSettingPageProps) => {
  const { workspaceId } = await params;
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const initialValues = await getWorkspace({ workspaceId });

  if (!initialValues) {
    redirect(`/workspaces/${workspaceId}`);
  }


  return (
    <div className="w-full lg:max-w-xl">
      <UpdateWorkspaceForm
        initialValues={{
          $id: initialValues.$id,
          name: initialValues.name,
          imageUrl: initialValues.imageUrl,
        }}
      />
    </div>
  );
};

export default WorkspaceIdSettingPage;
