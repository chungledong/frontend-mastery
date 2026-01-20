// 1. Nhúng file CSS và Import thư viện
import './style.css'
import type { StatItem, Order } from './types';
import Chart from 'chart.js/auto'; // 🔥 Import Chart.js

// --- PHẦN 1: LOGIC MENU ---
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// --- PHẦN 2: LOGIC DỮ LIỆU THỐNG KÊ (MOCK DATA) ---
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
    label: "Tỉ lệ hoàn đơn",
    value: "2.4%",
    colorClass: "text-red-600 bg-red-100",
    iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  }
];

const container = document.querySelector<HTMLElement>('#stats-container');
if (container) {
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
  `).join('');
  container.innerHTML = htmlContent;
}

// --- PHẦN 3: QUẢN LÝ ĐƠN HÀNG (CRUD + LOCAL STORAGE + CHART) ---

const STORAGE_KEY = 'my_app_orders';

// Hàm lấy dữ liệu từ kho
const loadOrders = (): Order[] => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    return JSON.parse(savedData);
  }
  return [];
};

// Khởi tạo mảng orders
const orders: Order[] = loadOrders();

// Lấy element
const orderForm = document.getElementById('order-form') as HTMLFormElement;
const nameInput = document.getElementById('customer-name') as HTMLInputElement;
const amountInput = document.getElementById('order-amount') as HTMLInputElement;
const tableBody = document.getElementById('order-table-body');

// Hàm lưu dữ liệu vào kho
const saveOrdersToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

// --- PHẦN 4: HÀM VẼ BIỂU ĐỒ (Đưa lên trước để dùng được trong renderOrders) ---
let myChart: Chart | null = null;

const renderChart = () => {
  const canvas = document.getElementById('myChart') as HTMLCanvasElement;
  if (!canvas) return;

  // Tính toán dữ liệu
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  // Xóa biểu đồ cũ nếu có
  if (myChart) {
    myChart.destroy();
  }

  // Vẽ biểu đồ mới
  myChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Đang xử lý', 'Hoàn thành', 'Đã hủy'],
      datasets: [{
        label: 'Số lượng đơn',
        data: [processingCount, completedCount, cancelledCount],
        backgroundColor: [
          '#3b82f6', // Xanh dương
          '#22c55e', // Xanh lá
          '#ef4444'  // Đỏ
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
};

// --- PHẦN 5: RENDER GIAO DIỆN CHÍNH ---

// Hàm xử lý logic xóa
const deleteOrder = (idToDelete: number) => {
  const isConfirmed = confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?');
  if (!isConfirmed) return;

  const index = orders.findIndex(order => order.id === idToDelete);
  
  if (index !== -1) {
    orders.splice(index, 1);
    saveOrdersToStorage();
    renderOrders(); // Sẽ tự động gọi renderChart bên trong
  }
};

// Hàm chuyển đổi trạng thái: Processing -> Completed -> Cancelled -> Processing
const toggleStatus = (idToToggle: number) => {
  const order = orders.find(o => o.id === idToToggle);
  if (order) {
    if (order.status === 'Processing') order.status = 'Completed';
    else if (order.status === 'Completed') order.status = 'Cancelled';
    else order.status = 'Processing';

    // Lưu và vẽ lại
    saveOrdersToStorage();
    renderOrders();
  }
};
// Hàm render bảng (Và gọi Chart)
const renderOrders = () => {
  if (!tableBody) return;

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-gray-400 italic">
          Chưa có đơn hàng nào. Hãy nhập form ở trên!
        </td>
      </tr>
    `;
    // Vẫn gọi renderChart kể cả khi không có đơn (để hiện biểu đồ rỗng hoặc xóa biểu đồ cũ)
    renderChart(); 
    return;
  }

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'Processing') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const html = orders.map(order => {
    const formattedMoney = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount);
    
    return `
      <tr class="hover:bg-gray-50 transition-colors group">
        <td class="p-4 text-gray-500">#${order.id}</td>
        <td class="p-4 font-medium text-gray-900">${order.customerName}</td>
        <td class="p-4 text-gray-500 text-sm">${order.date}</td>
        <td class="p-4">
          <span 
            class="status-btn cursor-pointer select-none px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)} hover:opacity-80 transition-opacity"
            data-id="${order.id}"
            title="Click để đổi trạng thái"
          >
            ${order.status}
          </span>
        </td>
        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-3">
            <span class="font-bold text-gray-800">${formattedMoney}</span>
            <button 
              class="delete-btn bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
              data-id="${order.id}"
              title="Xóa đơn hàng này"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = html;

  // 🔥 QUAN TRỌNG: Vẽ lại biểu đồ mỗi khi bảng thay đổi
  renderChart();
};

// Gọi render ngay lần đầu tiên
renderOrders();

// --- PHẦN 6: XỬ LÝ SỰ KIỆN ---

// Xử lý Submit Form
if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    
    if (name.length === 0 || amount <= 0) {
      alert("Vui lòng nhập đúng thông tin!");
      return;
    }

    const newOrder: Order = {
      id: Date.now(),
      customerName: name,
      amount: amount,
      status: 'Processing',
      date: new Date().toLocaleDateString('vi-VN')
    };

    orders.push(newOrder); 
    saveOrdersToStorage();
    renderOrders(); // Tự động cập nhật cả bảng và biểu đồ

    orderForm.reset();
    nameInput.focus();
  });
}
// Lắng nghe sự kiện Xóa (Event Delegation)
if (tableBody) {
  tableBody.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    // 1. Xử lý nút XÓA (Logic cũ)
    const deleteButton = target.closest('.delete-btn') as HTMLButtonElement;
    if (deleteButton) {
      const id = Number(deleteButton.dataset.id);
      deleteOrder(id);
      return; // Dừng lại không chạy tiếp
    }

    // 2. 🔥 MỚI: Xử lý nút ĐỔI TRẠNG THÁI
    const statusButton = target.closest('.status-btn') as HTMLElement;
    if (statusButton) {
      const id = Number(statusButton.dataset.id);
      toggleStatus(id);
    }
  });
}

