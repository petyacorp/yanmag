import ArticleEditor from "@/components/admin/ArticleEditor";
import { getCategories } from "@/lib/actions/categories";
import { getTags } from "@/lib/actions/tags";

export default async function NewArticlePage() {
  const categories = await getCategories();
  const tags = await getTags();
  return <ArticleEditor isEditing={false} categories={categories} tags={tags} />;
}
