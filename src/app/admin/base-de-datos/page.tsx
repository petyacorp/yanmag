import DatabaseVisualizer from "@/components/admin/DatabaseVisualizer";
import { getDatabaseSchema } from "@/lib/actions/database";

export const metadata = {
  title: "Base de Datos | YAN MAG Portal",
  description: "Inspector de esquema, tablas, relaciones y políticas de base de datos",
};

export default async function BaseDeDatosPage() {
  let schemaData = null;
  let isSchemaPending = false;

  try {
    schemaData = await getDatabaseSchema();
  } catch (err) {
    isSchemaPending = true;
  }

  return (
    <div className="py-4">
      <DatabaseVisualizer initialData={schemaData} isSchemaPending={isSchemaPending} />
    </div>
  );
}
