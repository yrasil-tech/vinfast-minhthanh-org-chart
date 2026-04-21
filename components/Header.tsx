"use client";

interface HeaderProps {
  totalNodes: number;
  filledNodes: number;
  isAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onFit: () => void;
  onAddNode: () => void;
}

export default function Header({
  totalNodes, filledNodes, isAuth,
  onLogin, onLogout, onExpandAll, onCollapseAll, onFit, onAddNode,
}: HeaderProps) {
  const vacant = totalNodes - filledNodes;

  return (
    <header className="bg-gradient-to-r from-vf-green to-vf-dark text-white shadow-xl print:hidden">
      <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SƠ ĐỒ TỔ CHỨC</h1>
          <p className="text-green-200 text-sm mt-1">
            Công ty Cổ phần Ô tô Minh Thanh TPHCM — Showroom VinFast Minh Thanh
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chart controls */}
          <div className="flex gap-1">
            <button onClick={onFit} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm" title="Vừa màn hình">⊞</button>
            <button onClick={() => {}} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm" title="Phóng to" id="btn-zoom-in">＋</button>
            <button onClick={() => {}} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm" title="Thu nhỏ" id="btn-zoom-out">－</button>
            <button onClick={onExpandAll} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm" title="Mở tất cả">▼</button>
            <button onClick={onCollapseAll} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm" title="Thu gọn">▲</button>
          </div>

          {/* Auth + Add */}
          {isAuth ? (
            <div className="flex gap-2">
              <button
                onClick={onAddNode}
                className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                ＋ Thêm vị trí
              </button>
              <button
                onClick={onLogout}
                className="bg-white/15 hover:bg-white/25 rounded-xl px-4 py-2 text-sm transition-all"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Chỉnh sửa
            </button>
          )}

          {/* Stats */}
          <div className="text-xs text-green-200 text-right leading-relaxed">
            Tổng: <strong className="text-white">{totalNodes}</strong><br />
            Có người: <strong className="text-white">{filledNodes}</strong> · Trống: <strong className="text-yellow-300">{vacant}</strong>
          </div>
        </div>
      </div>
    </header>
  );
}
