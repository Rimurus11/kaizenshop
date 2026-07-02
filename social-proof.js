document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     Social Proof Popup - Thông báo mua hàng gần đây (hiệu ứng FOMO)
     Chỉ chạy ở trang index. Không backend, không lưu trữ.
     ========================================================================== */

  // Danh sách khách mua ảo: tên + ảnh avatar thật (tải sẵn trong assets/avatars/)
  // img = số thứ tự file avN.jpg; ảnh đã gán đúng nam/nữ theo tên.
  const buyers = [
    { name: 'Nguyễn Minh Phi', img: 1 },
    { name: 'Trần Thị Hồng', img: 2 },
    { name: 'Lê Văn Cường', img: 3 },
    { name: 'Phạm Thu Hà', img: 4 },
    { name: 'Hoàng Đức Anh', img: 5 },
    { name: 'Vũ Thị Lan', img: 6 },
    { name: 'Đặng Quốc Bảo', img: 7 },
    { name: 'Bùi Ngọc Mai', img: 8 },
    { name: 'Đỗ Hải Nam', img: 9 },
    { name: 'Ngô Thị Thắm', img: 10 },
    { name: 'Dương Văn Tú', img: 11 },
    { name: 'Lý Thị Kim Chi', img: 12 },
    { name: 'Phan Trọng Nghĩa', img: 13 },
    { name: 'Trương Mỹ Linh', img: 14 },
    { name: 'Đinh Công Hậu', img: 15 },
    { name: 'Cao Thị Bích', img: 16 },
    { name: 'Võ Thanh Sơn', img: 17 },
    { name: 'Huỳnh Gia Bảo', img: 18 },
    { name: 'Tạ Thị Yến', img: 19 },
    { name: 'Mai Văn Lộc', img: 20 }
  ];

  const products = [
    'Đã mua combo Mua 1 Tặng 1 + Miễn phí vận chuyển',
    'Đã mua Gói Cơ Bản 01 Chảo + Miễn phí vận chuyển'
  ];

  // Tỉnh/thành để tăng độ tin cậy cho thông báo
  const cities = [
    'Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Bắc Ninh',
    'Thanh Hóa', 'Nam Định', 'Quảng Ninh', 'Buôn Ma Thuột', 'Vinh'
  ];

  // Chuyển số giây thành chuỗi thời gian tương đối tiếng Việt
  function formatRelativeTime(seconds) {
    if (seconds < 60) {
      return seconds <= 5 ? 'Vài giây trước' : `${seconds} giây trước`;
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} phút trước`;
    }
    return `${Math.floor(seconds / 3600)} giờ trước`;
  }

  // Thời gian nghiêng về "vừa xong" để cảm giác đơn đang nổ liên tục
  function recentSeconds() {
    const r = Math.random();
    if (r < 0.25) return Math.floor(Math.random() * 55) + 5;        // 5-59 giây
    if (r < 0.85) return (Math.floor(Math.random() * 15) + 1) * 60; // 1-15 phút
    return (Math.floor(Math.random() * 30) + 16) * 60;             // 16-45 phút
  }

  // Sinh một mục thông báo ngẫu nhiên
  let productIndex = 0;
  function pickNotification() {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    // Xoay vòng sản phẩm để cân bằng 2 gói
    const product = products[productIndex % products.length];
    productIndex++;
    return { buyer, city, product, timeText: formatRelativeTime(recentSeconds()) };
  }

  // Lấy chữ cái đầu của tên (dự phòng khi ảnh lỗi)
  function getInitial(name) {
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
  }

  // Tạo phần tử popup (dùng lại 1 node duy nhất)
  const popup = document.createElement('div');
  popup.className = 'social-proof-popup';
  popup.setAttribute('role', 'status');
  popup.setAttribute('aria-live', 'polite');
  popup.innerHTML = `
    <div class="sp-avatar">
      <span class="sp-avatar-fallback"></span>
      <img class="sp-avatar-img" alt="" referrerpolicy="no-referrer">
      <span class="sp-dot" title="Đang hoạt động"></span>
    </div>
    <div class="sp-body">
      <div class="sp-name"></div>
      <div class="sp-product"></div>
      <div class="sp-time"></div>
    </div>
    <button class="sp-close" type="button" aria-label="Đóng thông báo">&times;</button>
  `;
  document.body.appendChild(popup);

  const avatarImg = popup.querySelector('.sp-avatar-img');
  const avatarFallback = popup.querySelector('.sp-avatar-fallback');
  const nameEl = popup.querySelector('.sp-name');
  const productEl = popup.querySelector('.sp-product');
  const timeEl = popup.querySelector('.sp-time');
  const closeBtn = popup.querySelector('.sp-close');

  // Nếu ảnh lỗi tải -> ẩn ảnh, hiện chữ cái đầu trên nền gradient
  avatarImg.addEventListener('error', () => {
    avatarImg.style.opacity = '0';
  });
  avatarImg.addEventListener('load', () => {
    avatarImg.style.opacity = '1';
  });

  let hideTimer = null;
  let nextTimer = null;
  let stopped = false;

  function showNext() {
    if (stopped) return;
    const data = pickNotification();

    avatarFallback.textContent = getInitial(data.buyer.name);
    avatarImg.style.opacity = '0';
    avatarImg.src = `assets/avatars/av${data.buyer.img}.jpg`;
    avatarImg.alt = data.buyer.name;
    nameEl.innerHTML = `${data.buyer.name} <span class="sp-city">· ${data.city}</span>`;
    productEl.textContent = data.product;
    timeEl.innerHTML = `<span class="sp-verified">✓ Đã xác minh</span> · ${data.timeText}`;

    popup.classList.add('visible');

    // Giữ hiển thị ~5s rồi ẩn
    hideTimer = setTimeout(hideCurrent, 5000);
  }

  function hideCurrent() {
    popup.classList.remove('visible');
    // Sau khi ẩn, chờ ngẫu nhiên 8-15s rồi hiện popup kế tiếp
    const delay = 8000 + Math.random() * 7000;
    nextTimer = setTimeout(showNext, delay);
  }

  // Nút X: đóng hẳn chuỗi thông báo cho phiên hiện tại
  closeBtn.addEventListener('click', () => {
    stopped = true;
    clearTimeout(hideTimer);
    clearTimeout(nextTimer);
    popup.classList.remove('visible');
  });

  // Popup đầu tiên sau ~4s tải trang
  setTimeout(showNext, 4000);

});
