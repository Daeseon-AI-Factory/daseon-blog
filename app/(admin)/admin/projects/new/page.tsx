import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { githubConfigured } from "@/lib/github";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <ProjectEditor
      mode="new"
      savingVia={githubConfigured() ? "github" : "local"}
      initial={{
        locale: "en",
        slug: "",
        title: "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
        translationKey: "",
        status: "active",
        featured: false,
        url: "",
        repo: "",
        logSourceRepo: "",
        tags: "",
        stack: "",
        role: "",
        body: "",
      }}
    />
  );
}
