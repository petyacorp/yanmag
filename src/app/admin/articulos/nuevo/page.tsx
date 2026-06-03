import ArticleEditor from "@/components/admin/ArticleEditor";
import { getCategories } from "@/lib/actions/categories";

export default async function NewArticlePage() {
  const categories = await getCategories();
  return <ArticleEditor isEditing={false} categories={categories} />;
}
