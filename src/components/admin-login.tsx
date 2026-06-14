import { FormEvent, useState } from "react";

interface AdminLoginProps {
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export function AdminLogin({ onLogin, isLoading }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const result = await onLogin(password);
    if (!result.success) {
      setError(result.error || "Login failed");
      setPassword("");
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>Admin Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={isLoading}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading || !password}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
