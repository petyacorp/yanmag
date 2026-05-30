import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { ReactNode } from "react";

export const metadata = {
  title: "YAN MAG | Portal Editorial",
  description: "Panel de administración de YAN MAG",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="dark min-h-screen bg-[var(--color-yan-ivory)] text-[var(--color-yan-charcoal)] flex font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-8 overflow-y-auto bg-[var(--background)]">
            <div className="max-w-[1200px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
