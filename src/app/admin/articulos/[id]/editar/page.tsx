import ArticleEditor from "@/components/admin/ArticleEditor";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  // En un entorno real, buscaríamos el artículo con el ID
  return <ArticleEditor isEditing={true} />;
}
