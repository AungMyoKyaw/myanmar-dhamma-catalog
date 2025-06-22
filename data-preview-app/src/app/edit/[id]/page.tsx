import { notFound } from "next/navigation";
import { EditContentForm } from "@/components/edit/EditContentForm";
import { getDatabase } from "@/lib/database";
import type { ContentItem } from "@/lib/types";

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getContentItem(id: string): Promise<ContentItem | null> {
  try {
    const db = getDatabase();
    const contentId = parseInt(id, 10);

    if (Number.isNaN(contentId)) {
      return null;
    }

    return db.getContentById(contentId);
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;
  const content = await getContentItem(id);

  if (!content) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Content</h1>
        <p className="text-muted-foreground">
          Update and correct metadata for content item #{content.id}
        </p>
      </div>

      <EditContentForm content={content} />
    </div>
  );
}
