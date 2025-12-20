



import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChangePassword() {
  const { user, token, setUser, setToken, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword || !newPassword) {
      setError("Please fill both fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      // 🔹 Step 1: Change password
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      // 🔸 Handle invalid or expired token
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        logout(); // clear local storage + context
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to change password");
      }

      // 🔹 Step 2: Auto re-login with the new password
      // const loginRes = await fetch(`${API}/api/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     identifier: user.username,
      //     password: newPassword,
      //   }),
      // });

      // ✅ Step 2: Force logout and redirect to login
      logout();
      navigate("/login", { replace: true });

      // if (!loginRes.ok) {
      //   const loginErr = await loginRes.json().catch(() => null);
      //   throw new Error(loginErr?.message || "Auto-login failed");
      // }

      const loginData = await loginRes.json();

      // 🔹 Step 3: Update context + localStorage
      await loginData(loginData.access_token, loginData.user);
      // 🔹 Step 4: Redirect to dashboard or previous page
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Password change error:", err);
      setError(err.message || "Error changing password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
          Change Password
        </h2>

        {error && (
          <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="border p-2 rounded-lg w-full"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded-lg w-full"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 rounded-lg w-full"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition ${
                saving ? "opacity-70" : ""
              }`}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}