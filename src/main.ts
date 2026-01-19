// 1. Nhúng file CSS vào (để Vite biết đường tải Tailwind)
import './style.css'
import type { StatItem , Order} from './types'; // Nhập khuôn mẫu vào
 
/// --- PHẦN 1: LOGIC MENU (Giữ nguyên code cũ của bạn ở đây) ---
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// --- PHẦN 2: LOGIC DỮ LIỆU ĐỘNG (Mới) ---

// 1. Giả lập dữ liệu từ Server trả về (Mock Data)
const statistics: StatItem[] = [
  {
    id: 1,
    label: "Tổng doanh thu",
    value: "120.500.000 ₫",
    colorClass: "text-blue-600 bg-blue-100",
    iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    id: 2,
    label: "Khách hàng mới",
    value: "1,240",
    colorClass: "text-purple-600 bg-purple-100",
    iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
  },
  {
    id: 3,
    label: "Đơn hàng",
    value: "856",
    colorClass: "text-green-600 bg-green-100",
    iconPath: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
  },
  {
    id: 4,
    label: "Tỉ lệ hoàn đơn", // Thử thêm thẻ thứ 4 để thấy sức mạnh
    value: "2.4%",
    colorClass: "text-red-600 bg-red-100",
    iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  }
];

// 2. Tìm thẻ chứa (Container)
const container = document.querySelector<HTMLElement>('#stats-container');

// 3. Hàm render (Vẽ HTML từ dữ liệu)
if (container) {
  // Dùng hàm map để biến đổi từng cục Data thành chuỗi HTML
  const htmlContent = statistics.map(item => `
    <article class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:bg-gray-50 transition-shadow duration-300 flex items-center space-x-4">
      <div class="p-3 rounded-full ${item.colorClass}">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.iconPath}" />
        </svg>
      </div>
      <div>
        <p class="text-gray-500 text-sm font-medium">${item.label}</p>
        <h3 class="text-2xl font-bold text-gray-800">${item.value}</h3>
      </div>
    </article>
  `).join(''); // Gộp tất cả thành 1 chuỗi lớn

  // Gán vào DOM
  container.innerHTML = htmlContent;
}

// --- PHẦN 3: XỬ LÝ FORM & VALIDATION ---

// 1. Khởi tạo mảng dữ liệu rỗng (State)
const orders: Order[] = []; 

// 2. Lấy element
const orderForm = document.getElementById('order-form') as HTMLFormElement;
const nameInput = document.getElementById('customer-name') as HTMLInputElement;
const amountInput = document.getElementById('order-amount') as HTMLInputElement;
const tableBody = document.getElementById('order-table-body');

// 3. Hàm render (Vẽ lại bảng dựa trên dữ liệu hiện có)
const renderOrders = () => {
  if (!tableBody) return;

  // Nếu mảng rỗng -> Hiện thông báo
  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-gray-400 italic">
          Chưa có đơn hàng nào. Hãy nhập form ở trên!
        </td>
      </tr>
    `;
    return;
  }

  // Nếu có dữ liệu -> Map ra HTML
  // Tư duy Clean Code: Tách hàm xử lý màu sắc status ra
  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'Processing') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const html = orders.map(order => {
    const formattedMoney = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount);
    
    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-4 text-gray-500">#${order.id}</td>
        <td class="p-4 font-medium text-gray-900">${order.customerName}</td>
        <td class="p-4 text-gray-500 text-sm">${order.date}</td>
        <td class="p-4">
          <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}">
            ${order.status}
          </span>
        </td>
        <td class="p-4 text-right font-bold text-gray-800">${formattedMoney}</td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = html;
};

// 4. Xử lý Submit Form (Logic thêm mới)
if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    
    // Validation đơn giản (như bài trước)
    if (name.length === 0 || amount <= 0) {
      alert("Vui lòng nhập đúng thông tin!");
      return;
    }

    // TẠO DỮ LIỆU MỚI (Create)
    const newOrder: Order = {
      id: Date.now(), // Dùng thời gian làm ID tạm
      customerName: name,
      amount: amount,
      status: 'Processing', // Mặc định là đang xử lý
      date: new Date().toLocaleDateString('vi-VN') // Ngày hiện tại
    };

    // Thêm vào mảng (State Update)
    orders.push(newOrder); // Đẩy vào cuối danh sách
    // Hoặc dùng: orders.unshift(newOrder); // Nếu muốn đẩy lên đầu

    // GỌI HÀM VẼ LẠI GIAO DIỆN (UI Update)
    renderOrders();

    // Reset Form
    orderForm.reset();
    nameInput.focus();
  });
}