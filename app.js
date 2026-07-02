document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. Interactive Egg Slide Logic (Parabolic Curve Motion)
     ========================================================================== */
  const eggSlider = document.getElementById('egg-control-slider');
  const eggSlice = document.getElementById('egg-slice-item');
  const interactiveArea = document.getElementById('pan-interactive-area');

  // Cập nhật vị trí quả trứng dựa trên giá trị slider
  function updateEggPosition(value) {
    // value từ 0 đến 100
    // Chuyển đổi thành X trong khoảng [-130px, 130px]
    const percent = value / 100;
    const x = (percent - 0.5) * 260;
    
    // Tạo quỹ đạo parabol lòng chảo cong: y = a * x^2 + b
    // Điểm thấp nhất ở giữa (x=0, y=10px), cao hơn ở hai bên (x=±130, y=-40px)
    const y = 0.002 * (x * x) - 20;
    
    // Xoay nhẹ quả trứng khi trượt để tạo cảm giác tự nhiên
    const rotate = (percent - 0.5) * 45; // nghiêng từ -22.5 đến 22.5 độ
    
    eggSlice.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
  }

  // Khởi tạo vị trí ban đầu
  if (eggSlider && eggSlice) {
    updateEggPosition(eggSlider.value);
    eggSlider.addEventListener('input', (e) => {
      updateEggPosition(e.target.value);
    });
  }

  // Tương tác kéo thả chuột/chạm trực tiếp trên quả trứng (Drag & Drop)
  let isDragging = false;
  let startX = 0;
  let startSliderVal = 50;

  if (eggSlice && eggSlider) {
    eggSlice.addEventListener('mousedown', startDrag);
    eggSlice.addEventListener('touchstart', startDrag, { passive: true });

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag, { passive: false });

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
  }

  function startDrag(e) {
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    startSliderVal = parseInt(eggSlider.value, 10);
    eggSlice.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }

  function drag(e) {
    if (!isDragging) return;
    
    if (e.type === 'touchmove') {
      e.preventDefault(); // Ngăn cuộn trang khi kéo trên mobile
    }

    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startX;
    
    // Ước tính sự thay đổi giá trị slider (vùng kéo dài tầm 300px tương đương 100 đơn vị slider)
    const sliderWidth = interactiveArea.clientWidth || 400;
    const deltaValue = (deltaX / (sliderWidth * 0.6)) * 100;
    
    let newValue = Math.min(100, Math.max(0, startSliderVal + deltaValue));
    eggSlider.value = newValue;
    updateEggPosition(newValue);
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    eggSlice.style.cursor = 'grab';
    document.body.style.userSelect = '';
  }


  /* ==========================================================================
     2. Smart Countdown Timer (Khóa theo Session để giữ uy tín)
     ========================================================================== */
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  let targetTime;
  const sessionTarget = sessionStorage.getItem('promo_countdown_target');

  if (sessionTarget) {
    targetTime = parseInt(sessionTarget, 10);
  } else {
    // 2 giờ 45 phút đếm ngược
    const duration = (2 * 60 * 60 + 45 * 60) * 1000;
    targetTime = Date.now() + duration;
    sessionStorage.setItem('promo_countdown_target', targetTime);
  }

  function updateCountdown() {
    const now = Date.now();
    const distance = targetTime - now;

    if (distance < 0) {
      // Nếu hết thời gian, reset lại 2h45m để luôn hiển thị chạy
      const duration = (2 * 60 * 60 + 45 * 60) * 1000;
      targetTime = Date.now() + duration;
      sessionStorage.setItem('promo_countdown_target', targetTime);
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  /* ==========================================================================
     3. Checkout Form Submission & Data Storage
     ========================================================================== */
  const orderForm = document.getElementById('order-form');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullname = document.getElementById('fullname').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const address = document.getElementById('address').value.trim();
      const packageSelection = document.getElementById('package').value;
      const note = document.getElementById('note').value.trim();

      // Kiểm tra đơn giản số điện thoại hợp lệ (10-11 số)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone)) {
        alert('Vui lòng nhập số điện thoại hợp lệ (từ 10 đến 11 chữ số).');
        return;
      }

      // Tạo mã đơn hàng ngẫu nhiên dạng KZT-XXXXX
      const orderCode = 'KZT-' + Math.floor(10000 + Math.random() * 90000);

      // Định dạng tên gói hiển thị và số tiền
      let packageName = '';
      let packagePrice = '';
      if (packageSelection === 'basic') {
        packageName = 'Gói Cơ Bản (01 Chảo Kaizen Titan)';
        packagePrice = '399.000đ';
      } else {
        packageName = 'Gói Combo (Mua 1 Tặng 1 - 02 Chảo Kaizen Titan)';
        packagePrice = '649.000đ';
      }

      // Đóng gói dữ liệu đơn hàng
      const orderData = {
        orderCode: orderCode,
        fullname: fullname,
        phone: phone,
        address: address,
        packageName: packageName,
        packagePrice: packagePrice,
        note: note || 'Không có',
        timestamp: new Date().toLocaleString('vi-VN')
      };

      // Lưu trữ vào localStorage
      localStorage.setItem('last_frying_pan_order', JSON.stringify(orderData));

      // Hiệu ứng chuyển hướng mượt mà
      const submitBtn = document.getElementById('submit-order-button');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Đang xử lý đơn hàng...';
      }

      setTimeout(() => {
        window.location.href = 'thankyou.html';
      }, 800);
    });
  }

  // Smooth scroll cho các liên kết anchor
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

});
