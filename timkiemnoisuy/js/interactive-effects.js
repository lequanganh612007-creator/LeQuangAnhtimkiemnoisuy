/**
 * INTERACTIVE EFFECTS & ANIMATED STORY VIDEO PLAYER
 * - Confetti Canvas Particle System (Pháo hoa ăn mừng khi tìm thấy kết quả)
 * - Animated Story Video Canvas Player (Thước phim hoạt họa giải thích thuật toán có timeline)
 * - Mini-game "Thử tài đoán vị trí pos"
 */

// ==========================================
// 1. CONFETTI PARTICLE SYSTEM (PHÁO HOA HẠT SÁNG)
// ==========================================
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    if (!this.canvas) return;
    const colors = ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#38bdf8', '#fbbf24'];

    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1
      });
    }

    if (!this.animationId) {
      this.loop();
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.rotation += p.rotationSpeed;
      p.life -= 0.015;
      p.opacity = Math.max(0, p.life);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();

      if (p.life <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================
// 2. ANIMATED STORY VIDEO CANVAS PLAYER
// ==========================================
class StoryAnimationPlayer {
  constructor(canvasId, subtitleId, timelineFillId, btnPlayId, btnRestartId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.subtitleEl = document.getElementById(subtitleId);
    this.timelineFill = document.getElementById(timelineFillId);
    this.btnPlay = document.getElementById(btnPlayId);
    this.btnRestart = document.getElementById(btnRestartId);

    this.isPlaying = false;
    this.currentTime = 0; // seconds
    this.totalDuration = 24; // 24 seconds story
    this.animFrame = null;
    this.lastTimestamp = null;

    if (this.canvas) {
      this.setupCanvas();
      this.bindEvents();
      this.draw(0);
    }
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  bindEvents() {
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => this.togglePlay());
    }
    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', () => this.restart());
    }

    const timelineBar = this.timelineFill ? this.timelineFill.parentElement : null;
    if (timelineBar) {
      timelineBar.addEventListener('click', (e) => {
        const rect = timelineBar.getBoundingClientRect();
        const clickRatio = (e.clientX - rect.left) / rect.width;
        this.currentTime = Math.max(0, Math.min(this.totalDuration, clickRatio * this.totalDuration));
        this.draw(this.currentTime);
        this.updateUI();
      });
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0;
    }
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    if (this.btnPlay) this.btnPlay.innerHTML = '⏸ Tạm dừng';
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    if (this.btnPlay) this.btnPlay.innerHTML = '▶ Xem video hoạt họa';
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  restart() {
    this.pause();
    this.currentTime = 0;
    this.draw(0);
    this.updateUI();
    this.play();
  }

  loop() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.currentTime += delta;
    if (this.currentTime >= this.totalDuration) {
      this.currentTime = this.totalDuration;
      this.draw(this.currentTime);
      this.updateUI();
      this.pause();
      return;
    }

    this.draw(this.currentTime);
    this.updateUI();
    this.animFrame = requestAnimationFrame(() => this.loop());
  }

  updateUI() {
    const progress = (this.currentTime / this.totalDuration) * 100;
    if (this.timelineFill) {
      this.timelineFill.style.width = `${progress}%`;
    }
  }

  // Vẽ các phân cảnh theo dòng thời gian
  draw(t) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Nền vũ trụ công nghệ
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#0e172a');
    bgGrad.addColorStop(1, '#050914');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ==========================================
    // PHÂN CẢNH 1: BÀI TOÁN TRA TỪ ĐIỂN (0s - 6s)
    // ==========================================
    if (t < 6) {
      this.setSubtitle('🎬 Cảnh 1: Tìm từ bắt đầu bằng chữ "Z" trong cuốn từ điển 1.000 trang...');

      // Vẽ cuốn từ điển
      const bookX = w / 2 - 140;
      const bookY = h / 2 - 80;
      const bookW = 280;
      const bookH = 160;

      // Trang sách
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(bookX, bookY, bookW, bookH, 12);
      ctx.fill();
      ctx.stroke();

      // Gáy sách chia đôi
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(w / 2, bookY);
      ctx.lineTo(w / 2, bookY + bookH);
      ctx.stroke();

      // Minh họa nhị phân: Lật ở giữa
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Binary: Bổ đôi ở giữa trang 500 (chữ M)', bookX - 30, bookY - 18);

      // Minh họa nội suy: Lật gần cuối
      const animPos = Math.min(1, t / 4);
      const targetPageX = bookX + bookW * 0.88;
      
      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(targetPageX - 8, bookY + 10, 16, bookH - 20);
      ctx.restore();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Interpolation: Lật ngay về trang 950 (chữ Z)!', bookX + 30, bookY + bookH + 28);
    }
    // ==========================================
    // PHÂN CẢNH 2: CƠ CHẾ TỶ LỆ NỘI SUY (6s - 12s)
    // ==========================================
    else if (t < 12) {
      this.setSubtitle('🎬 Cảnh 2: Công thức đo tỷ lệ phần trăm khoảng cách của giá trị x...');

      const meterX = w / 2 - 160;
      const meterY = h / 2 - 20;
      const meterW = 320;
      const meterH = 34;

      // Vẽ thanh dải giá trị từ arr[low] đến arr[high]
      ctx.fillStyle = '#090f1d';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(meterX, meterY, meterW, meterH, 8);
      ctx.fill();
      ctx.stroke();

      // Mức tỷ lệ chạy động theo thời gian
      const ratioProgress = Math.min(0.75, 0.2 + ((t - 6) / 6) * 0.55);
      const fillW = meterW * ratioProgress;

      const fillGrad = ctx.createLinearGradient(meterX, 0, meterX + fillW, 0);
      fillGrad.addColorStop(0, '#06b6d4');
      fillGrad.addColorStop(1, '#ec4899');
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.roundRect(meterX, meterY, fillW, meterH, 8);
      ctx.fill();

      // Nhãn đầu cuối
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('arr[low] = 10', meterX - 10, meterY - 12);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText('arr[high] = 90', meterX + meterW - 75, meterY - 12);

      // Điểm x
      const xPos = meterX + fillW;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(xPos, meterY + meterH / 2, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Mục tiêu x = 70 (${Math.round(ratioProgress * 100)}% dải giá trị)`, meterX + 30, meterY + meterH + 34);
    }
    // ==========================================
    // PHÂN CẢNH 3: BẢN CHẤT HÌNH HỌC (12s - 18s)
    // ==========================================
    else if (t < 18) {
      this.setSubtitle('🎬 Cảnh 3: Phương trình đường thẳng nối 2 điểm mốc và giao điểm tìm pos...');

      const ox = w / 2 - 130;
      const oy = h / 2 + 80;
      const axLen = 260;
      const ayLen = 170;

      // Trục tọa độ
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + axLen, oy);
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - ayLen);
      ctx.stroke();

      // Đường thẳng nội suy phát sáng
      const p1 = { x: ox + 20, y: oy - 20 };
      const p2 = { x: ox + axLen - 20, y: oy - ayLen + 20 };

      ctx.save();
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();

      // Đường gióng ngang x
      const targetY = oy - 110;
      ctx.strokeStyle = '#ec4899';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, targetY);
      ctx.lineTo(ox + axLen, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm giao nội suy
      const interpX = p1.x + ((targetY - p1.y) / (p2.y - p1.y)) * (p2.x - p1.x);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(interpX, targetY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Đường gióng vuông góc xuống pos
      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(interpX, targetY);
      ctx.lineTo(interpX, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('Chiếu xuống trục hoành ➜ Tìm ra vị trí pos!', ox + 20, oy + 26);
    }
    // ==========================================
    // PHÂN CẢNH 4: SỨC MẠNH VƯỢT TRỘI (18s - 24s)
    // ==========================================
    else {
      this.setSubtitle('🎬 Cảnh 4: Kết luận: Tốc độ O(log(log n)) siêu tốc với mảng phân bố đều!');

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ SO SÁNH TRÊN 1.000.000 PHẦN TỬ ⚡', w / 2, h / 2 - 60);

      // Binary Search
      ctx.fillStyle = '#60a5fa';
      ctx.font = '15px sans-serif';
      ctx.fillText('• Binary Search O(log n): Cần khoảng ~20 lần so sánh', w / 2, h / 2 - 15);

      // Interpolation Search
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('• Interpolation Search O(log(log n)): Chỉ cần ~4 - 5 lần so sánh!', w / 2, h / 2 + 25);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText('Tối ưu gấp 4-5 lần khi mảng phân bố đồng đều!', w / 2, h / 2 + 65);
      ctx.textAlign = 'left';
    }
  }

  setSubtitle(text) {
    if (this.subtitleEl) {
      this.subtitleEl.textContent = text;
    }
  }
}

// ==========================================
// 3. MINI-GAME: THỬ TÀI DỰ ĐOÁN POS
// ==========================================
class PosPredictionGame {
  constructor(containerId, scoreId, resultBoxId) {
    this.container = document.getElementById(containerId);
    this.scoreEl = document.getElementById(scoreId);
    this.resultBox = document.getElementById(resultBoxId);
    this.score = 0;
    this.currentQuestion = null;

    this.initGame();
  }

  generateQuestion() {
    const size = 8;
    const start = Math.floor(Math.random() * 10) + 10;
    const step = Math.floor(Math.random() * 8) + 5;
    const arr = [];
    for (let i = 0; i < size; i++) arr.push(start + i * step);

    const targetIdx = Math.floor(Math.random() * (size - 2)) + 1;
    const x = arr[targetIdx];
    const low = 0;
    const high = size - 1;

    // Công thức tính pos
    const ratio = (x - arr[low]) / (arr[high] - arr[low]);
    const correctPos = low + Math.floor(ratio * (high - low));

    return {
      arr,
      x,
      low,
      high,
      correctPos
    };
  }

  initGame() {
    this.currentQuestion = this.generateQuestion();
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const q = this.currentQuestion;

    const promptDiv = document.createElement('div');
    promptDiv.style.marginBottom = '14px';
    promptDiv.innerHTML = `
      <p style="font-size: 0.95rem; color: #fff;">
        Cho mảng: <code>[${q.arr.join(', ')}]</code><br>
        Cần tìm giá trị <strong>x = ${q.x}</strong> (với low = ${q.low}, high = ${q.high}).<br>
        👉 <em>Hãy nhấp vào ô mà bạn dự đoán công thức sẽ tính ra <strong>pos</strong>:</em>
      </p>
    `;
    this.container.appendChild(promptDiv);

    const nodesWrap = document.createElement('div');
    nodesWrap.style.display = 'flex';
    nodesWrap.style.gap = '8px';
    nodesWrap.style.flexWrap = 'wrap';

    q.arr.forEach((val, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.fontFamily = 'monospace';
      btn.style.fontSize = '0.95rem';
      btn.style.padding = '8px 14px';
      btn.innerHTML = `[${idx}]<br><strong>${val}</strong>`;

      btn.addEventListener('click', () => this.handleGuess(idx));
      nodesWrap.appendChild(btn);
    });

    this.container.appendChild(nodesWrap);
  }

  handleGuess(userGuessIdx) {
    const q = this.currentQuestion;
    const isCorrect = userGuessIdx === q.correctPos;

    if (isCorrect) {
      this.score += 10;
      if (window.confettiCannon) {
        window.confettiCannon.burst();
      }
      if (this.resultBox) {
        this.resultBox.innerHTML = `
          <div style="color: #34d399; font-weight: bold; margin-top: 10px;">
            🎉 CHÍNH XÁC! pos = ${q.correctPos} (arr[${q.correctPos}] = ${q.arr[q.correctPos]}). Bạn nhận được +10 điểm!
          </div>
        `;
      }
    } else {
      if (this.resultBox) {
        this.resultBox.innerHTML = `
          <div style="color: #fb7185; margin-top: 10px;">
            Chưa đúng rồi! Bạn chọn index [${userGuessIdx}], nhưng công thức tính ra pos = ${q.correctPos} (arr[${q.correctPos}] = ${q.arr[q.correctPos]}).
          </div>
        `;
      }
    }

    if (this.scoreEl) {
      this.scoreEl.textContent = `${this.score} điểm`;
    }

    setTimeout(() => {
      this.initGame();
      if (this.resultBox) this.resultBox.innerHTML = '';
    }, 2800);
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.confettiCannon = new ConfettiCannon('confettiCanvas');

  // Khởi tạo Animated Video Story Player
  window.storyPlayer = new StoryAnimationPlayer(
    'storyCanvas',
    'storySubtitle',
    'storyTimelineFill',
    'btnStoryPlay',
    'btnStoryRestart'
  );

  // Khởi tạo Game Thử tài
  window.posGame = new PosPredictionGame(
    'gameChoicesContainer',
    'gameScoreText',
    'gameResultFeedback'
  );

  // Video Tab Switching (Hoạt họa canvas vs Video bài giảng YouTube)
  document.querySelectorAll('.video-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.video-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetView = tab.dataset.target;
      const animWrapper = document.getElementById('storyAnimWrapper');
      const youtubeWrapper = document.getElementById('youtubeVideoWrapper');

      if (targetView === 'canvas-story') {
        if (animWrapper) animWrapper.style.display = 'block';
        if (youtubeWrapper) youtubeWrapper.style.display = 'none';
      } else if (targetView === 'youtube-lecture') {
        if (animWrapper) animWrapper.style.display = 'none';
        if (youtubeWrapper) youtubeWrapper.style.display = 'block';
        if (window.storyPlayer) window.storyPlayer.pause();
      }
    });
  });
});
