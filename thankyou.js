document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Retrieve and Display Order Summary
     ========================================================================== */
  const orderDataStr = localStorage.getItem('last_frying_pan_order');
  
  if (orderDataStr) {
    try {
      const order = JSON.parse(orderDataStr);
      
      document.getElementById('summary-code').textContent = order.orderCode || 'KZT-00000';
      document.getElementById('summary-name').textContent = order.fullname || 'Chưa cung cấp';
      document.getElementById('summary-phone').textContent = order.phone || 'Chưa cung cấp';
      document.getElementById('summary-address').textContent = order.address || 'Chưa cung cấp';
      document.getElementById('summary-package').textContent = order.packageName || 'Chưa chọn';
      document.getElementById('summary-price').textContent = order.packagePrice || '0đ';
      document.getElementById('summary-note').textContent = order.note || 'Không có';
    } catch (e) {
      console.error('Lỗi phân tích dữ liệu đơn hàng:', e);
    }
  }


  /* ==========================================================================
     2. Canvas Confetti / Firework Effect
     ========================================================================== */
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const colors = [
    '#ff2e2e', // red
    '#ff7a00', // orange
    '#ffd60a', // yellow
    '#00f5d4', // cyan
    '#7b2cbf', // purple
    '#f15bb5'  // pink
  ];

  class Confetti {
    constructor() {
      this.x = Math.random() * canvas.width;
      // Sinh từ dưới đáy màn hình bay lên hoặc từ trên rơi xuống
      this.y = Math.random() * -canvas.height;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 4 + 4;
      
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
      
      this.opacity = 1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      
      // Nếu rơi quá màn hình, reset lên đỉnh
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
        this.speedY = Math.random() * 4 + 4;
        this.speedX = Math.random() * 4 - 2;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      
      // Vẽ hình chữ nhật giấy nhỏ
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
      ctx.restore();
    }
  }

  const confettiArray = [];
  const maxConfetti = 120;

  for (let i = 0; i < maxConfetti; i++) {
    confettiArray.push(new Confetti());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiArray.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animate);
  }

  animate();

});
