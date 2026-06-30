import { useState } from "react";

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { error?: string };
    return data.error || `Login failed (${response.status})`;
  }

  const text = await response.text();
  return text.trim() || `Login failed (${response.status})`;
}

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
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as { token: string };

      if (!data.token) {
        throw new Error("Login response did not include a token.");
      }

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
