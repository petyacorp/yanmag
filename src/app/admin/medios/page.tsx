import MediaManager from "@/components/admin/MediaManager";

export const metadata = {
  title: "Administración de Medios | YAN MAG Portal",
  description: "Organiza imágenes y administra carpetas de medios editoriales",
};

export default function MediosPage() {
  return (
    <div className="py-4">
      <MediaManager />
    </div>
  );
}
