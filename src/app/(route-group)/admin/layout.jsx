import DashboardLayout from "@/components/dashboard";

export default function AdminLayout({ children }) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}