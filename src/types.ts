// src/types.ts

// Định nghĩa khuôn mẫu cho một thẻ thống kê
export interface StatItem {
  id: number;
  label: string;      // Ví dụ: "Tổng doanh thu"
  value: string;      // Ví dụ: "120.500.000 ₫"
  iconPath: string;   // Đường dẫn SVG của icon
  colorClass: string; // Màu sắc (blue, purple, green)
}

// Thêm interface mới cho Đơn hàng
export interface Order {
  id: number;
  customerName: string;
  amount: number;
  status: 'Processing' | 'Completed' | 'Cancelled'; // Chỉ cho phép 3 trạng thái này
  date: string;
}