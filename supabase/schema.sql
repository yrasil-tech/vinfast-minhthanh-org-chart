-- ============================================================
-- VINFAST MINH THANH — SƠ ĐỒ TỔ CHỨC
-- Chạy SQL này trong Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tạo bảng
CREATE TABLE IF NOT EXISTS org_nodes (
  id          TEXT PRIMARY KEY,
  parent_id   TEXT DEFAULT '',
  name        TEXT DEFAULT '',
  position    TEXT NOT NULL,
  department  TEXT NOT NULL DEFAULT 'leadership',
  dept_color  TEXT DEFAULT '#00843D',
  level       INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index
CREATE INDEX IF NOT EXISTS idx_org_nodes_parent ON org_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_nodes_dept   ON org_nodes(department);

-- 3. Auto-update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_nodes_updated ON org_nodes;
CREATE TRIGGER trg_org_nodes_updated
  BEFORE UPDATE ON org_nodes
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 4. RLS — cho phép đọc public, ghi qua API
ALTER TABLE org_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"  ON org_nodes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON org_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON org_nodes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON org_nodes FOR DELETE USING (true);

-- ============================================================
-- 5. SEED DATA — 71 vị trí
-- ============================================================
INSERT INTO org_nodes (id, parent_id, name, position, department, dept_color, level, sort_order) VALUES
  -- Ban lãnh đạo
  ('N01', '',     '',                     'ĐẠI HỘI ĐỒNG CỔ ĐÔNG',           'leadership', '#00843D', 0,  1),
  ('N02', 'N01',  'Ông Đỗ Ngọc Đại',     'CHỦ TỊCH HĐQT',                   'leadership', '#00843D', 1,  2),
  ('N03', 'N02',  '',                     'TỔNG GIÁM ĐỐC',                   'leadership', '#00843D', 2,  3),
  ('N04', 'N03',  '',                     'PHÓ TỔNG GIÁM ĐỐC',               'leadership', '#00843D', 3,  4),

  -- Khối Kinh doanh
  ('N05', 'N04',  'Trần Như Phương',      'GĐ KINH DOANH',                   'sales', '#0077B6', 4,  10),
  ('N06', 'N05',  '',                     'GIẢNG VIÊN ĐÀO TẠO NỘI BỘ (KD)', 'sales', '#0077B6', 5,  11),
  ('N07', 'N05',  'Nguyễn Minh Đức',      'TRƯỞNG PHÒNG KD 1',               'sales', '#0077B6', 5,  12),
  ('N08', 'N07',  'Nguyễn Vinh Tiến',     'TVBH 1 (Phòng KD 1)',             'sales', '#0077B6', 6,  13),
  ('N09', 'N07',  '',                     'TVBH 2 (Phòng KD 1)',             'sales', '#0077B6', 6,  14),
  ('N10', 'N07',  '',                     'TVBH 3 (Phòng KD 1)',             'sales', '#0077B6', 6,  15),
  ('N11', 'N07',  '',                     'TVBH 4 (Phòng KD 1)',             'sales', '#0077B6', 6,  16),
  ('N12', 'N07',  '',                     'TVBH 5 (Phòng KD 1)',             'sales', '#0077B6', 6,  17),
  ('N13', 'N07',  '',                     'TVBH 6 (Phòng KD 1)',             'sales', '#0077B6', 6,  18),
  ('N14', 'N07',  '',                     'TVBH 7 (Phòng KD 1)',             'sales', '#0077B6', 6,  19),
  ('N15', 'N07',  '',                     'TVBH 8 (Phòng KD 1)',             'sales', '#0077B6', 6,  20),
  ('N16', 'N07',  '',                     'TVBH 9 (Phòng KD 1)',             'sales', '#0077B6', 6,  21),
  ('N17', 'N07',  '',                     'TVBH 10 (Phòng KD 1)',            'sales', '#0077B6', 6,  22),

  ('N18', 'N05',  'Hồ Cao Nguyên',        'TRƯỞNG PHÒNG KD 2',               'sales', '#0077B6', 5,  23),
  ('N19', 'N18',  '',                     'TVBH 1 (Phòng KD 2)',             'sales', '#0077B6', 6,  24),
  ('N20', 'N18',  '',                     'TVBH 2 (Phòng KD 2)',             'sales', '#0077B6', 6,  25),
  ('N21', 'N18',  '',                     'TVBH 3 (Phòng KD 2)',             'sales', '#0077B6', 6,  26),
  ('N22', 'N18',  '',                     'TVBH 4 (Phòng KD 2)',             'sales', '#0077B6', 6,  27),
  ('N23', 'N18',  '',                     'TVBH 5 (Phòng KD 2)',             'sales', '#0077B6', 6,  28),
  ('N24', 'N18',  '',                     'TVBH 6 (Phòng KD 2)',             'sales', '#0077B6', 6,  29),
  ('N25', 'N18',  '',                     'TVBH 7 (Phòng KD 2)',             'sales', '#0077B6', 6,  30),
  ('N26', 'N18',  '',                     'TVBH 8 (Phòng KD 2)',             'sales', '#0077B6', 6,  31),
  ('N27', 'N18',  '',                     'TVBH 9 (Phòng KD 2)',             'sales', '#0077B6', 6,  32),
  ('N28', 'N18',  '',                     'TVBH 10 (Phòng KD 2)',            'sales', '#0077B6', 6,  33),

  ('N29', 'N05',  'Ms. Tươi',             'TRƯỞNG PHÒNG KD 3',               'sales', '#0077B6', 5,  34),
  ('N30', 'N29',  '',                     'TVBH 1 (Phòng KD 3)',             'sales', '#0077B6', 6,  35),
  ('N31', 'N29',  '',                     'TVBH 2 (Phòng KD 3)',             'sales', '#0077B6', 6,  36),
  ('N32', 'N29',  '',                     'TVBH 3 (Phòng KD 3)',             'sales', '#0077B6', 6,  37),
  ('N33', 'N29',  '',                     'TVBH 4 (Phòng KD 3)',             'sales', '#0077B6', 6,  38),
  ('N34', 'N29',  '',                     'TVBH 5 (Phòng KD 3)',             'sales', '#0077B6', 6,  39),
  ('N35', 'N29',  '',                     'TVBH 6 (Phòng KD 3)',             'sales', '#0077B6', 6,  40),
  ('N36', 'N29',  '',                     'TVBH 7 (Phòng KD 3)',             'sales', '#0077B6', 6,  41),
  ('N37', 'N29',  '',                     'TVBH 8 (Phòng KD 3)',             'sales', '#0077B6', 6,  42),
  ('N38', 'N29',  '',                     'TVBH 9 (Phòng KD 3)',             'sales', '#0077B6', 6,  43),
  ('N39', 'N29',  '',                     'TVBH 10 (Phòng KD 3)',            'sales', '#0077B6', 6,  44),

  ('N49', 'N05',  '',                     'BỘ PHẬN KD BẢO HIỂM',            'sales', '#0077B6', 5,  45),
  ('N50', 'N05',  '',                     'BỘ PHẬN KD PHỤ KIỆN BÁN HÀNG',   'sales', '#0077B6', 5,  46),
  ('N51', 'N05',  '',                     'BỘ PHẬN HỖ TRỢ BÁN HÀNG',        'sales', '#0077B6', 5,  47),
  ('N52', 'N05',  '',                     'CHĂM SÓC KHÁCH HÀNG',             'sales', '#0077B6', 5,  48),
  ('N53', 'N05',  '',                     'MARKETING',                        'sales', '#0077B6', 5,  49),

  -- Khối Kế toán
  ('N40', 'N04',  'Ngô Thị Phi Yến',      'KẾ TOÁN TRƯỞNG',                  'finance', '#D97706', 4, 50),
  ('N54', 'N40',  '',                     'KẾ TOÁN TỔNG HỢP',               'finance', '#D97706', 5, 51),
  ('N55', 'N40',  '',                     'KẾ TOÁN XE MỚI',                 'finance', '#D97706', 5, 52),
  ('N56', 'N40',  '',                     'KẾ TOÁN DỊCH VỤ',                'finance', '#D97706', 5, 53),
  ('N57', 'N40',  '',                     'THỦ QUỸ / THU NGÂN',             'finance', '#D97706', 5, 54),

  -- Khối HC-NS
  ('N41', 'N04',  '',                     'TP. HÀNH CHÍNH NHÂN SỰ',          'hr', '#7C3AED', 4, 60),
  ('N42', 'N41',  'Nghiêm T.T. Trang',    'PP. HÀNH CHÍNH NHÂN SỰ',          'hr', '#7C3AED', 5, 61),
  ('N58', 'N41',  '',                     'LỄ TÂN',                          'hr', '#7C3AED', 5, 62),
  ('N59', 'N41',  '',                     'IT',                               'hr', '#7C3AED', 5, 63),
  ('N60', 'N41',  '',                     'BẢO VỆ',                          'hr', '#7C3AED', 5, 64),
  ('N61', 'N41',  '',                     'LÁI XE',                          'hr', '#7C3AED', 5, 65),
  ('N62', 'N41',  '',                     'BẢO TRÌ',                         'hr', '#7C3AED', 5, 66),

  -- Khối Dịch vụ
  ('N43', 'N04',  '',                     'GĐ DỊCH VỤ',                      'service', '#E11D48', 4, 70),
  ('N44', 'N43',  '',                     'GIẢNG VIÊN ĐÀO TẠO NỘI BỘ (DV)', 'service', '#E11D48', 5, 71),
  ('N45', 'N43',  'Ngô Vũ Long',          'TRƯỞNG BP DVDV',                  'service', '#E11D48', 5, 72),
  ('N46', 'N45',  '',                     'CỐ VẤN DỊCH VỤ 1',               'service', '#E11D48', 6, 73),
  ('N47', 'N45',  '',                     'CỐ VẤN DỊCH VỤ 2',               'service', '#E11D48', 6, 74),
  ('N48', 'N45',  '',                     'CỐ VẤN DỊCH VỤ 3',               'service', '#E11D48', 6, 75),
  ('N63', 'N43',  '',                     'TRƯỞNG BP PHỤ TÙNG',             'service', '#E11D48', 5, 76),
  ('N64', 'N63',  '',                     'NHÂN VIÊN PHỤ TÙNG',             'service', '#E11D48', 6, 77),
  ('N65', 'N43',  '',                     'XƯỞNG DỊCH VỤ',                  'service', '#E11D48', 5, 78),
  ('N66', 'N65',  '',                     'TỔ SỬA CHỮA CHUNG',             'service', '#E11D48', 6, 79),
  ('N67', 'N66',  '',                     'KỸ THUẬT VIÊN',                  'service', '#E11D48', 7, 80),
  ('N68', 'N65',  '',                     'XƯỞNG ĐỒNG SƠN',                'service', '#E11D48', 6, 81),
  ('N69', 'N68',  '',                     'NHÂN VIÊN ĐỒNG',                 'service', '#E11D48', 7, 82),
  ('N70', 'N68',  '',                     'PHA SƠN',                        'service', '#E11D48', 7, 83),
  ('N71', 'N68',  '',                     'NHÂN VIÊN SƠN',                  'service', '#E11D48', 7, 84)

ON CONFLICT (id) DO NOTHING;
