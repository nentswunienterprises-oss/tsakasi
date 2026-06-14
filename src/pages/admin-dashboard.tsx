import { AdminLogin } from "@/components/admin-login";
import { AdminSubmissions } from "@/components/admin-submissions";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminDashboardPage() {
  const { token, isLoading, login, logout, isAuthenticated } = useAdminAuth();

  if (isLoading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} isLoading={isLoading} />;
  }

  return <AdminSubmissions token={token!} onLogout={logout} />;
}
