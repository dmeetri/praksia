// Category pages are already wrapped by dashboard/layout.tsx → DashboardLayout
// This layout just passes children through to avoid a duplicate sidebar
export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
