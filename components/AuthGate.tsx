"use client";

import { useState } from "react";

interface AuthGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthGate({ isOpen, onClose, onSuccess }: AuthGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setPassword("");
      onSuccess();
    } else {
      setError("Sai mật khẩu. Vui lòng thử lại.");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl">✕</button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-vf-light rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-vf-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Xác thực chỉnh sửa</h2>
          <p className="text-slate-500 text-sm mt-1">Nhập mật khẩu để chỉnh sửa sơ đồ tổ chức</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-vf-green focus:outline-none text-center text-lg tracking-wider"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 bg-vf-green hover:bg-vf-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Đang kiểm tra..." : "Xác nhận"}
          </button>
        </form>
      </div>
    </div>
  );
}
