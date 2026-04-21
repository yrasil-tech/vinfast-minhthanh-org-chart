"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { OrgNode } from "@/lib/types";
import Header from "@/components/Header";
import AuthGate from "@/components/AuthGate";
import NodeEditor from "@/components/NodeEditor";

// d3-org-chart uses DOM → no SSR
const OrgChart = dynamic(() => import("@/components/OrgChart"), { ssr: false });

const DEPT_LEGEND = [
  { color: "#00843D", label: "Ban lãnh đạo" },
  { color: "#0077B6", label: "Kinh doanh" },
  { color: "#D97706", label: "Kế toán — Tài chính" },
  { color: "#7C3AED", label: "HC — Nhân sự" },
  { color: "#E11D48", label: "Dịch vụ" },
];

export default function Home() {
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Editor state
  const [editNode, setEditNode] = useState<OrgNode | null>(null);
  const [isNewNode, setIsNewNode] = useState(false);

  // Fetch nodes
  const fetchNodes = useCallback(async () => {
    const res = await fetch("/api/nodes");
    if (res.ok) {
      const data = await res.json();
      setNodes(data);
    }
    setLoading(false);
  }, []);

  // Check auth
  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth");
    if (res.ok) {
      const data = await res.json();
      setIsAuth(data.authenticated);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
    checkAuth();
  }, [fetchNodes, checkAuth]);

  // Auth handlers
  function handleLoginClick() {
    setShowAuth(true);
  }
  function handleAuthSuccess() {
    setIsAuth(true);
    setShowAuth(false);
  }
  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAuth(false);
    setEditNode(null);
    setIsNewNode(false);
  }

  // Node click → open editor
  function handleNodeClick(node: OrgNode) {
    setEditNode(node);
    setIsNewNode(false);
  }

  // Add new node
  function handleAddNode() {
    setEditNode(null);
    setIsNewNode(true);
  }

  // Save node (create or update) — optimistic update
  async function handleSaveNode(nodeData: Partial<OrgNode> & { id: string }) {
    const method = isNewNode ? "POST" : "PUT";
    const res = await fetch("/api/nodes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nodeData),
    });
    if (res.ok) {
      const saved = await res.json() as OrgNode;
      if (isNewNode) {
        // Add new node to local state
        setNodes((prev) => [...prev, saved]);
      } else {
        // Update existing node in local state
        setNodes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
      }
      setEditNode(null);
      setIsNewNode(false);
    } else {
      const err = await res.json();
      alert(err.error || "Lỗi lưu dữ liệu");
    }
  }

  // Delete node — optimistic update
  async function handleDeleteNode(id: string) {
    const res = await fetch("/api/nodes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const { deleted } = await res.json();
      const deletedSet = new Set(deleted as string[]);
      // Remove deleted nodes from local state
      setNodes((prev) => prev.filter((n) => !deletedSet.has(n.id)));
      setEditNode(null);
    } else {
      const err = await res.json();
      alert(err.error || "Lỗi xóa dữ liệu");
    }
  }

  // Chart controls
  function handleFit() {
    const chart = (window as any).__orgChart;
    if (chart) chart.fit();
  }
  function handleExpandAll() {
    const chart = (window as any).__orgChart;
    if (chart) chart.expandAll().fit();
  }
  function handleCollapseAll() {
    const chart = (window as any).__orgChart;
    if (chart) chart.collapseAll().expandLevel(2).fit();
  }

  const filledCount = nodes.filter((n) => n.name?.trim()).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        totalNodes={nodes.length}
        filledNodes={filledCount}
        isAuth={isAuth}
        onLogin={handleLoginClick}
        onLogout={handleLogout}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onFit={handleFit}
        onAddNode={handleAddNode}
      />

      {/* Legend */}
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex flex-wrap gap-4 items-center text-xs print:hidden">
        <span className="text-slate-500 font-medium">Chú thích:</span>
        {DEPT_LEGEND.map((d) => (
          <span key={d.color} className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
            {d.label}
          </span>
        ))}
        {isAuth && (
          <span className="ml-auto text-vf-green font-medium">
            ✎ Bấm vào ô bất kỳ để chỉnh sửa
          </span>
        )}
      </div>

      {/* Chart */}
      <main className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-vf-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Đang tải sơ đồ tổ chức...</p>
            </div>
          </div>
        ) : (
          <OrgChart data={nodes} isAuth={isAuth} onNodeClick={handleNodeClick} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 print:hidden">
        <p>Công ty CP Ô tô Minh Thanh TPHCM — 30–32 Yersin, P. Bến Thành, TP.HCM</p>
      </footer>

      {/* Modals */}
      <AuthGate isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />

      {(editNode || isNewNode) && isAuth && (
        <NodeEditor
          node={editNode}
          allNodes={nodes}
          isNew={isNewNode}
          onSave={handleSaveNode}
          onDelete={handleDeleteNode}
          onClose={() => { setEditNode(null); setIsNewNode(false); }}
        />
      )}
    </div>
  );
}
