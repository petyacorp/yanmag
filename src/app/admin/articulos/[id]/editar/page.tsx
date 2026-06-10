import ArticleEditor from "@/components/admin/ArticleEditor";
import { getArticleById } from "@/lib/actions/articles";
import { getCategories } from "@/lib/actions/categories";
import { getTags } from "@/lib/actions/tags";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await getArticleById(resolvedParams.id);
  
  if (!article) {
    notFound();
  }
  
  const categories = await getCategories();
  const tags = await getTags();

  return <ArticleEditor isEditing={true} article={article} categories={categories} tags={tags} />;
}
