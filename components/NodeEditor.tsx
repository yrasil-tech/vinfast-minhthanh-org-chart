"use client";

import { useState, useEffect } from "react";
import { OrgNode, DEPARTMENTS, DEPT_CONFIG, Department } from "@/lib/types";

interface NodeEditorProps {
  node: OrgNode | null;
  allNodes: OrgNode[];
  isNew?: boolean;
  onSave: (node: Partial<OrgNode> & { id: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function NodeEditor({ node, allNodes, isNew, onSave, onDelete, onClose }: NodeEditorProps) {
  const [form, setForm] = useState<Partial<OrgNode>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (node) {
      setForm({ ...node });
    } else if (isNew) {
      setForm({
        id: "",
        parent_id: "",
        name: "",
        position: "",
        department: "sales",
        dept_color: "#0077B6",
        level: 5,
        sort_order: 99,
      });
    }
    setConfirmDelete(false);
  }, [node, isNew]);

  if (!node && !isNew) return null;

  const dept = DEPT_CONFIG[(form.department as Department) || "leadership"];

  function handleDeptChange(value: Department) {
    const colorMap: Record<Department, string> = {
      leadership: "#00843D", sales: "#0077B6", finance: "#D97706", hr: "#7C3AED", service: "#E11D48",
    };
    setForm((f) => ({ ...f, department: value, dept_color: colorMap[value] }));
  }

  async function handleSave() {
    if (!form.position?.trim()) return;
    setSaving(true);
    await onSave(form as Partial<OrgNode> & { id: string });
    setSaving(false);
  }

  async function handleDelete() {
    if (!node?.id || !onDelete) return;
    setSaving(true);
    await onDelete(node.id);
    setSaving(false);
  }

  // Build parent options
  const parentOptions = allNodes
    .filter((n) => n.id !== node?.id)
    .map((n) => ({ id: n.id, label: `${n.position}${n.name ? ` (${n.name})` : ""}` }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end">
      <div className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {isNew ? "Thêm vị trí mới" : "Chỉnh sửa vị trí"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">✕</button>
        </div>

        {/* Preview card */}
        <div className="px-6 pt-5">
          <div
            className="rounded-2xl p-5 text-center border-2 transition-all"
            style={{ background: dept.bg, borderColor: dept.border }}
          >
            <span
              className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full mb-2"
              style={{ background: dept.border + "22", color: dept.text }}
            >
              {dept.label}
            </span>
            <div className="font-bold text-sm" style={{ color: dept.text }}>
              {form.position || "Chức danh..."}
            </div>
            {form.name ? (
              <div className="text-sm text-slate-600 mt-1">{form.name}</div>
            ) : (
              <div className="text-xs text-slate-400 italic mt-1">( Chưa bổ nhiệm )</div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chức danh *</label>
            <input
              value={form.position || ""}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-xl focus:border-vf-green focus:outline-none"
              placeholder="VD: TRƯỞNG PHÒNG KD 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên người đảm nhiệm</label>
            <input
              value={form.name || ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-xl focus:border-vf-green focus:outline-none"
              placeholder="Bỏ trống nếu chưa có người"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban</label>
            <select
              value={form.department || "sales"}
              onChange={(e) => handleDeptChange(e.target.value as Department)}
              className="w-full px-3 py-2.5 border rounded-xl focus:border-vf-green focus:outline-none bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Báo cáo cho (cấp trên)</label>
            <select
              value={form.parent_id || ""}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-xl focus:border-vf-green focus:outline-none bg-white"
            >
              <option value="">— Không có (cấp cao nhất) —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cấp bậc</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.level ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, level: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 border rounded-xl focus:border-vf-green focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thứ tự</label>
              <input
                type="number"
                min={0}
                value={form.sort_order ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 border rounded-xl focus:border-vf-green focus:outline-none"
              />
            </div>
          </div>

          {!isNew && node?.id && (
            <div className="text-xs text-slate-400 pt-2 border-t">
              Mã vị trí: <code className="bg-slate-100 px-1 rounded">{node.id}</code>
              {node.updated_at && <> · Cập nhật: {new Date(node.updated_at).toLocaleDateString("vi-VN")}</>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !form.position?.trim()}
            className="flex-1 bg-vf-green hover:bg-vf-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : isNew ? "Tạo mới" : "Lưu thay đổi"}
          </button>

          {!isNew && onDelete && (
            confirmDelete ? (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-5 rounded-xl transition-all"
              >
                Xác nhận xóa
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-5 rounded-xl transition-all"
              >
                Xóa
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
