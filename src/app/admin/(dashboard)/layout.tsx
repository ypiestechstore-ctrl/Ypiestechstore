import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}
