# Sơ đồ Tổ chức — VinFast Minh Thanh TPHCM

Ứng dụng web hiển thị và chỉnh sửa sơ đồ cơ cấu tổ chức công ty.

## Tính năng

- Sơ đồ tổ chức tương tác (zoom, pan, thu gọn/mở rộng)
- Chỉnh sửa trực tiếp trên chart (click vào ô → sửa tên, chức danh)
- Thêm/xóa vị trí
- Bảo vệ bằng mật khẩu (chỉ người có mật khẩu mới chỉnh sửa được)
- Dữ liệu lưu trên Supabase (Postgres)
- Deploy trên Vercel

## Hướng dẫn cài đặt

### Bước 1: Tạo Supabase project

1. Vào [supabase.com](https://supabase.com) → **New Project**
2. Đặt tên project, chọn region `Southeast Asia (Singapore)`
3. Sau khi tạo xong, vào **Settings → API** → copy:
   - `Project URL` → dán vào `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → dán vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Bước 2: Tạo bảng dữ liệu

1. Trong Supabase Dashboard → **SQL Editor**
2. Copy toàn bộ nội dung file `supabase/schema.sql` → Paste → **Run**
3. Kiểm tra: vào **Table Editor** → phải thấy bảng `org_nodes` với 71 dòng

### Bước 3: Cấu hình môi trường

```bash
cp .env.local.example .env.local
```

Mở `.env.local` và điền:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EDIT_PASSWORD=MatKhauCuaBan
```

### Bước 4: Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### Bước 5: Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **Import** repo
3. Thêm 3 biến môi trường (Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `EDIT_PASSWORD`
4. Bấm **Deploy**

## Cách sử dụng

- **Xem sơ đồ**: Mở link → sơ đồ hiển thị ngay, ai cũng xem được
- **Chỉnh sửa**: Bấm nút "Chỉnh sửa" → nhập mật khẩu → bấm vào ô bất kỳ để sửa
- **Thêm vị trí**: Sau khi đăng nhập → bấm "＋ Thêm vị trí"
- **Xóa vị trí**: Mở editor → bấm "Xóa" (sẽ xóa luôn tất cả cấp dưới)

## Tech stack

- Next.js 14 (App Router)
- Tailwind CSS
- d3-org-chart + D3.js
- Supabase (Postgres)
- Vercel
