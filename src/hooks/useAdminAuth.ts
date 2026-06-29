import { useState } from "react";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : sessionStorage.getItem("admin-token"),
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = async (password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Login failed");
      }

      const data = (await response.json()) as { token: string };
      sessionStorage.setItem("admin-token", data.token);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin-token");
    setToken(null);
  };

  return { token, isLoading, login, logout, isAuthenticated: !!token };
}
