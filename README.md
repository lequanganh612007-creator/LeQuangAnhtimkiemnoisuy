# 🔍 Trình Mô Phỏng Thuật Toán Tìm Kiếm Nội Suy (Interpolation Search Visualizer)

Website trực quan hóa và học tập tương tác thuật toán **Tìm kiếm Nội suy (Interpolation Search)** phục vụ môn học **Cấu trúc dữ liệu và Giải thuật (DSA)**.

---

## 📌 1. Công Thức Cốt Lõi

$$pos = low + \left\lfloor \frac{x - arr[low]}{arr[high] - arr[low]} \times (high - low) \right\rfloor$$

Trong đó:
- **$x$**: Giá trị phần tử cần tìm.
- **$low$**: Chỉ số vị trí đầu khoảng tìm kiếm.
- **$high$**: Chỉ số vị trí cuối khoảng tìm kiếm.
- **$arr[low]$**: Giá trị phần tử tại vị trí đầu.
- **$arr[high]$**: Giá trị phần tử tại vị trí cuối.
- **$pos$**: Vị trí chỉ số dự đoán (vị trí nội suy).

---

## ✨ 2. Tính Năng Nổi Bật

- 🎯 **Lý thuyết chuyên sâu**: Chứng minh hình học từ phương trình đường thẳng qua 2 điểm $(low, arr[low])$ và $(high, arr[high])$.
- 🎬 **Trình mô phỏng trực quan tương tác**:
  - Chạy tự động (*Play/Pause*), Bước tới (*Next*), Lùi bước (*Prev*), Đặt lại (*Reset*).
  - Tùy chỉnh tốc độ thực thi linh hoạt.
  - Hỗ trợ phím tắt: `Space` (Play/Pause), `Mũi tên trái/phải` (Lùi/Tiến bước).
- 📐 **Thay số thời gian thực (Live Formula Evaluation)**: Hiển thị chi tiết từng phép tính số học vào công thức ở từng bước lặp.
- 📈 **Đồ thị Canvas phong cách Radar Kỹ thuật số**: Vẽ đường thẳng nội suy với dải màu phát sáng (Cyber glow) và giao điểm xác định hoành độ $pos$.
- 🔊 **Âm thanh tổng hợp (Web Audio API)**: Phát hiệu ứng âm thanh chân thực khi chuyển bước hoặc tìm thấy kết quả (hoạt động offline 100%).
- ⚔️ **Chế độ so sánh đối đầu (Duel Mode)**: Đọ sức số bước lặp giữa *Interpolation Search* và *Binary Search*.
- 💻 **Mã nguồn chuẩn DSA đa ngôn ngữ**: C++, Python, Java, JavaScript có chú thích tiếng Việt và nút Copy tiện lợi.
- 📝 **Trắc nghiệm ôn tập (Interactive Quiz)**: Bộ câu hỏi kiểm tra kiến thức có chấm điểm và giải thích chi tiết.

---

## 🚀 3. Cấu Trúc Thư Mục

```
timkiemnoisuy/
├── index.html       # Giao diện chính của website
├── css/
│   └── style.css    # Thiết kế Cyberpunk Dark Tech & Micro-animations
├── js/
│   ├── algorithm.js # Logic toán học của thuật toán
│   ├── visualizer.js# Trực quan hóa DOM và Canvas
│   └── app.js       # Quản lý sự kiện, âm thanh, quiz
├── .gitignore       # Bỏ qua các file không cần thiết
└── README.md        # Tài liệu giới thiệu dự án
```

---

## 🌐 4. Triển Khai Miễn Phí Lên GitHub Pages

Sau khi đẩy mã nguồn lên GitHub, bạn có thể kích hoạt tính năng **GitHub Pages** để trang web chạy online:
1. Vào repository trên GitHub.
2. Chọn tab **Settings** -> mục **Pages** (ở cột bên trái).
3. Tại phần **Branch**, chọn nhánh `main` và thư mục `/ (root)`.
4. Nhấn **Save**. Sau 1-2 phút, trang web sẽ có đường link online dạng:  
   `https://<username>.github.io/<tên-repo>/`
