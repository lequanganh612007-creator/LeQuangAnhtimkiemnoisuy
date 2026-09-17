/**
 * TRỰC QUAN HÓA THUẬT TOÁN TÌM KIẾM NỘI SUY
 * - Vẽ mảng DOM với hiệu ứng micro-animations, glow
 * - Khối tính toán công thức thời gian thực với màu sắc đồng bộ
 * - Vẽ biểu đồ đường thẳng hình học phong cách Cyberpunk Radar trên Canvas
 * - Cập nhật bảng vết thực thi
 */

class Visualizer {
  constructor(arrayContainerId, formulaContainerId, canvasId, tableBodyId) {
    this.arrayContainer = document.getElementById(arrayContainerId);
    this.formulaContainer = document.getElementById(formulaContainerId);
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.tableBody = document.getElementById(tableBodyId);

    // Canvas High-DPI setup
    if (this.canvas) {
      this.setupCanvasDPI();
      window.addEventListener('resize', () => {
        this.setupCanvasDPI();
        if (this.currentRenderData) {
          this.drawGeometricPlot(
            this.currentRenderData.arr,
            this.currentRenderData.stepData
          );
        }
      });
    }

    this.currentRenderData = null;
  }

  setupCanvasDPI() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width > 0 ? rect.width : 600;
    const height = rect.height > 0 ? rect.height : 260;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  // Khởi tạo hiển thị mảng ban đầu với tương tác Click-to-Search và Tooltip
  renderInitialArray(arr) {
    this.arrayContainer.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'array-nodes-wrapper';

    arr.forEach((val, idx) => {
      const node = document.createElement('div');
      node.className = 'array-node in-range';
      node.id = `node-${idx}`;

      const tooltip = document.createElement('div');
      tooltip.className = 'node-tooltip';
      tooltip.textContent = `🎯 Nhấp để tìm ${val}`;

      const box = document.createElement('div');
      box.className = 'node-box';
      box.textContent = val;

      const indexLabel = document.createElement('div');
      indexLabel.className = 'node-index';
      indexLabel.textContent = `[${idx}]`;

      node.appendChild(tooltip);
      node.appendChild(box);
      node.appendChild(indexLabel);

      // Tương tác nhấp chuột trực tiếp vào phần tử mảng để tìm kiếm
      node.addEventListener('click', () => {
        if (this.onSelectTarget) {
          this.onSelectTarget(val);
        }
      });

      wrapper.appendChild(node);
    });

    this.arrayContainer.appendChild(wrapper);
    this.resetFormula();
    this.resetTelemetryHUD(arr.length);
    if (this.tableBody) this.tableBody.innerHTML = '';
    this.drawGeometricPlot(arr, null);
  }

  // Cập nhật trạng thái từng bước
  renderStep(arr, stepData, currentStepIdx, totalSteps) {
    this.currentRenderData = { arr, stepData };
    const n = arr.length;
    const { low, high, pos, status, action, formulaCalc, x } = stepData;

    // 1. Cập nhật các ô phần tử mảng
    for (let i = 0; i < n; i++) {
      const node = document.getElementById(`node-${i}`);
      if (!node) continue;

      // Xoá class cũ và các thẻ pointer cũ
      node.className = 'array-node';
      const oldTags = node.querySelectorAll('.pointer-tag');
      oldTags.forEach(t => t.remove());

      // Phân loại trạng thái
      if (i < low || i > high) {
        node.classList.add('excluded');
      } else {
        node.classList.add('in-range');
      }

      if (i === low) {
        node.classList.add('is-low');
        const tag = document.createElement('div');
        tag.className = 'pointer-tag tag-low';
        tag.innerHTML = '▲<br>low';
        node.appendChild(tag);
      }

      if (i === high) {
        node.classList.add('is-high');
        const tag = document.createElement('div');
        tag.className = 'pointer-tag tag-high';
        tag.innerHTML = '▲<br>high';
        node.appendChild(tag);
      }

      if (i === pos && pos >= 0) {
        node.classList.add('is-pos');
        const tag = document.createElement('div');
        tag.className = 'pointer-tag tag-pos';
        tag.innerHTML = 'pos<br>▼';
        node.appendChild(tag);
      }

      if (status === 'found' && i === pos) {
        node.classList.add('is-found');
        const tag = document.createElement('div');
        tag.className = 'pointer-tag tag-found';
        tag.innerHTML = '🎯 TÌM THẤY!<br>▼';
        node.appendChild(tag);
      }
    }

    // Cuộn mượt đến phần tử pos nếu cần
    if (pos >= 0) {
      const posNode = document.getElementById(`node-${pos}`);
      if (posNode) {
        posNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }

    // 1b. Kích hoạt Laser Scanner quét tia sáng từ low đến pos
    if (pos >= 0) {
      this.triggerLaserScan(low, pos);
    }

    // 1c. Cập nhật thanh Telemetry HUD tương lai
    this.updateTelemetryHUD(stepData, currentStepIdx, totalSteps, n);

    // 2. Cập nhật khối công thức toán học chi tiết kèm thước đo tỷ lệ neon
    this.renderLiveFormula(stepData, currentStepIdx, totalSteps);

    // 3. Vẽ biểu đồ hình học trên Canvas
    this.drawGeometricPlot(arr, stepData);

    // 4. Cập nhật bảng vết
    this.highlightTableRow(currentStepIdx);
  }

  // Kích hoạt tia quét Laser neon lướt qua dải mảng
  triggerLaserScan(fromIdx, toIdx) {
    const wrapper = this.arrayContainer.querySelector('.array-nodes-wrapper');
    if (!wrapper) return;

    let laser = wrapper.querySelector('.laser-scan-line');
    if (!laser) {
      laser = document.createElement('div');
      laser.className = 'laser-scan-line';
      wrapper.appendChild(laser);
    }

    const fromNode = document.getElementById(`node-${fromIdx}`);
    const toNode = document.getElementById(`node-${toIdx}`);
    if (!fromNode || !toNode) return;

    const fromLeft = fromNode.offsetLeft + fromNode.offsetWidth / 2;
    const toLeft = toNode.offsetLeft + toNode.offsetWidth / 2;

    laser.style.transition = 'none';
    laser.style.left = `${fromLeft}px`;
    laser.classList.add('active');

    // Chuyển động lướt tia sáng đến toNode
    requestAnimationFrame(() => {
      laser.style.transition = 'left 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
      laser.style.left = `${toLeft}px`;
      setTimeout(() => {
        laser.classList.remove('active');
      }, 550);
    });
  }

  // Cập nhật các chỉ số Telemetry HUD thời gian thực
  updateTelemetryHUD(stepData, currentStepIdx, totalSteps, totalElements) {
    const led = document.getElementById('hudTelemetryLed');
    const statusVal = document.getElementById('hudStatusVal');
    const rangeVal = document.getElementById('hudRangeVal');
    const slopeVal = document.getElementById('hudSlopeVal');
    const reductionVal = document.getElementById('hudReductionVal');
    const posVal = document.getElementById('hudPosVal');

    const { status, low, high, pos, arrLow, arrHigh } = stepData;

    // Tính tỷ lệ không gian bị loại bỏ
    const remainingCount = Math.max(0, high - low + 1);
    const reductionRate = Math.round(((totalElements - remainingCount) / totalElements) * 100);

    // Hệ số góc đường nội suy k = deltaY / deltaX
    let slope = '-';
    if (high !== low && arrHigh !== undefined && arrLow !== undefined) {
      slope = ((arrHigh - arrLow) / (high - low)).toFixed(2);
    }

    if (led) {
      led.className = 'telemetry-led';
      if (status === 'found') led.style.background = 'var(--accent-emerald)';
      else if (status === 'calculating') led.classList.add('calculating');
      else led.classList.add('idle');
    }

    if (statusVal) {
      if (status === 'found') statusVal.innerHTML = '<span style="color: #34d399;">🎯 LOCKED & FOUND</span>';
      else if (status === 'narrow_right') statusVal.innerHTML = '<span style="color: #fb923c;">⏩ NARROW_RIGHT</span>';
      else if (status === 'narrow_left') statusVal.innerHTML = '<span style="color: #60a5fa;">⏪ NARROW_LEFT</span>';
      else if (status === 'not_found') statusVal.innerHTML = '<span style="color: #f87171;">❌ TERMINATED</span>';
      else statusVal.textContent = 'CALCULATING_POS';
    }

    if (rangeVal) rangeVal.textContent = `[${low} .. ${high}]`;
    if (slopeVal) slopeVal.textContent = `k = ${slope}`;
    if (reductionVal) reductionVal.textContent = `${reductionRate}% loại bỏ`;
    if (posVal) posVal.textContent = pos >= 0 ? `[${pos}]` : '-';
  }

  // Đặt lại Telemetry HUD về trạng thái chờ
  resetTelemetryHUD(totalElements = 12) {
    const led = document.getElementById('hudTelemetryLed');
    const statusVal = document.getElementById('hudStatusVal');
    const rangeVal = document.getElementById('hudRangeVal');
    const slopeVal = document.getElementById('hudSlopeVal');
    const reductionVal = document.getElementById('hudReductionVal');
    const posVal = document.getElementById('hudPosVal');

    if (led) {
      led.className = 'telemetry-led idle';
      led.style.background = '';
    }
    if (statusVal) statusVal.innerHTML = '<span style="color: #38bdf8;">STANDBY (READY)</span>';
    if (rangeVal) rangeVal.textContent = `[0 .. ${totalElements - 1}]`;
    if (slopeVal) slopeVal.textContent = 'k = -';
    if (reductionVal) reductionVal.textContent = '0% loại bỏ';
    if (posVal) posVal.textContent = '-';
  }

  // Render công thức chi tiết
  renderLiveFormula(stepData, currentStepIdx, totalSteps) {
    if (!this.formulaContainer) return;

    const { low, high, pos, arrLow, arrHigh, arrPos, x, status, formulaCalc, action } = stepData;

    if (status === 'not_found') {
      this.formulaContainer.innerHTML = `
        <div class="live-calc-header">
          <div class="calc-title" style="color: #f87171;">❌ KẾT QUẢ TÌM KIẾM</div>
          <div class="calc-step-badge" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.4);">Bước ${currentStepIdx + 1} / ${totalSteps}</div>
        </div>
        <div class="calc-body" style="color: #fca5a5; font-size: 1.1rem;">
          ${action}
        </div>
      `;
      return;
    }

    if (!formulaCalc) {
      this.formulaContainer.innerHTML = `<div class="calc-explanation">${action}</div>`;
      return;
    }

    const { numerator, denominator, ratio, posOffset } = formulaCalc;
    const ratioPercent = (ratio * 100).toFixed(1);
    const meterPercent = Math.max(0, Math.min(100, ratio * 100));

    let comparisonHTML = '';
    if (status === 'found') {
      comparisonHTML = `<span style="color: #34d399; font-weight: 800; font-size: 1.05rem;">✔ arr[pos] (${arrPos}) === x (${x}) ⇒ TÌM THẤY TẠI VỊ TRÍ ${pos}!</span>`;
    } else if (status === 'narrow_right') {
      comparisonHTML = `<span style="color: #fb923c; font-weight: 600;">arr[pos] (${arrPos}) &lt; x (${x}) ⇒ Thu hẹp sang nửa phải: low = pos + 1 = ${pos + 1}</span>`;
    } else if (status === 'narrow_left') {
      comparisonHTML = `<span style="color: #60a5fa; font-weight: 600;">arr[pos] (${arrPos}) &gt; x (${x}) ⇒ Thu hẹp sang nửa trái: high = pos - 1 = ${pos - 1}</span>`;
    } else {
      comparisonHTML = `<span>Đang thực hiện phép tính nội suy...</span>`;
    }

    this.formulaContainer.innerHTML = `
      <div class="live-calc-header">
        <div class="calc-title">
          <span>📐 THAY SỐ CÔNG THỨC THỰC TẾ (BƯỚC ${currentStepIdx + 1})</span>
        </div>
        <div class="calc-step-badge">Bước ${currentStepIdx + 1} / ${totalSteps}</div>
      </div>
      <div class="calc-body">
        <div class="calc-line">
          <strong>1. Công thức:</strong> 
          <code>pos = low + ⌊ ((x - arr[low]) / (arr[high] - arr[low])) × (high - low) ⌋</code>
        </div>
        <div class="calc-line">
          <strong>2. Thế giá trị:</strong>
          <code>pos = <span class="highlight-val hl-low" data-node="${low}">${low}</span> + ⌊ ((<span class="highlight-val hl-x">${x}</span> - <span class="highlight-val hl-low" data-node="${low}">${arrLow}</span>) / (<span class="highlight-val hl-high" data-node="${high}">${arrHigh}</span> - <span class="highlight-val hl-low" data-node="${low}">${arrLow}</span>)) × (<span class="highlight-val hl-high" data-node="${high}">${high}</span> - <span class="highlight-val hl-low" data-node="${low}">${low}</span>) ⌋</code>
        </div>
        <div class="calc-line">
          <strong>3. Tỷ lệ nội suy:</strong>
          <code>Tỷ lệ = (${numerator} / ${denominator}) = <span style="color: #38bdf8; font-weight: bold;">${ratio.toFixed(4)}</span> (${ratioPercent}% tổng độ dài dải giá trị)</code>
        </div>

        <!-- Thước đo tỷ lệ phần trăm trực quan sinh động -->
        <div class="ratio-meter-box">
          <div class="ratio-meter-header">
            <span style="color: var(--low-color);">arr[low]: ${arrLow} (0%)</span>
            <span style="color: #c084fc; font-weight: 800;">Mục tiêu x: ${x} (${ratioPercent}%)</span>
            <span style="color: var(--high-color);">arr[high]: ${arrHigh} (100%)</span>
          </div>
          <div class="ratio-meter-track">
            <div class="ratio-meter-fill" style="width: ${meterPercent}%;"></div>
          </div>
        </div>

        <div class="calc-line" style="margin-top: 10px;">
          <strong>4. Khoảng dịch:</strong>
          <code>Offset = ⌊ ${ratio.toFixed(4)} × ${high - low} ⌋ = ⌊ ${(ratio * (high - low)).toFixed(2)} ⌋ = <span style="color: #c084fc; font-weight: bold;">${posOffset}</span></code>
        </div>
        <div class="calc-line">
          <strong>5. Vị trí dự đoán:</strong>
          <code>pos = ${low} + ${posOffset} = <span class="highlight-val hl-pos" data-node="${pos}">${pos}</span> ⇒ arr[${pos}] = <strong style="color: #fff; font-size: 1.15rem;">${arrPos}</strong></code>
        </div>

        <!-- Thẻ giải phẫu 4 bước toán học trực quan -->
        <div class="formula-breakdown-cards">
          <div class="f-card f-base highlight-val" data-node="${low}" title="Chỉ số mốc bắt đầu của dải tìm kiếm">
            <div class="f-label">1. MỐC BẮT ĐẦU (low)</div>
            <div class="f-value">[${low}]</div>
            <div class="f-sub">Giá trị mốc = <strong>${arrLow}</strong></div>
          </div>
          <div class="f-card f-ratio" title="Tỷ lệ % của khoảng cách mục tiêu">
            <div class="f-label">2. TỶ LỆ DỰ ĐOÁN (ratio)</div>
            <div class="f-value">${ratioPercent}%</div>
            <div class="f-sub">Δx / Δdải = ${numerator} / ${denominator}</div>
          </div>
          <div class="f-card f-span" title="Số lượng phần tử trong dải tìm kiếm hiện tại">
            <div class="f-label">3. ĐỘ DÀI DẢI (high - low)</div>
            <div class="f-value">${high - low} ô</div>
            <div class="f-sub">Khoảng [${low}] đến [${high}]</div>
          </div>
          <div class="f-card f-pos highlight-val" data-node="${pos}" title="Vị trí phần tử nội suy dự đoán">
            <div class="f-label">4. VỊ TRÍ KHÓA (pos)</div>
            <div class="f-value">[${pos}]</div>
            <div class="f-sub">arr[${pos}] = <strong>${arrPos}</strong> (dịch +${posOffset})</div>
          </div>
        </div>

        <div class="live-calc-intuition">
          💡 <strong>Trực giác giải thuật:</strong> Mục tiêu <code>x = ${x}</code> nằm ở mốc <strong>${ratioPercent}%</strong> trên dải giá trị từ <code>${arrLow}</code> đến <code>${arrHigh}</code>. Phép nội suy tính ngay độ dịch <code>+${posOffset}</code> ô tính từ mốc <code>low=${low}</code>, cho ra chỉ số kiểm tra <strong>pos = [${pos}]</strong> thay vì phải chia đôi chính giữa một cách máy móc!
        </div>
      </div>
      <div class="calc-explanation">
        <strong>Kết luận rẽ nhánh:</strong> ${comparisonHTML}
      </div>
    `;

    // Gắn sự kiện rê chuột vào các số để làm sáng ô tương ứng trên mảng
    this.bindFormulaHoverSync();
  }

  // Đồng bộ hiệu ứng hover giữa công thức và ô mảng
  bindFormulaHoverSync() {
    if (!this.formulaContainer) return;
    const hlItems = this.formulaContainer.querySelectorAll('.highlight-val[data-node]');
    hlItems.forEach(item => {
      const targetIdx = item.getAttribute('data-node');
      item.style.cursor = 'pointer';
      item.addEventListener('mouseenter', () => {
        const node = document.getElementById(`node-${targetIdx}`);
        if (node) {
          node.classList.add('is-pos');
          node.style.transform = 'translateY(-14px) scale(1.15)';
        }
      });
      item.addEventListener('mouseleave', () => {
        const node = document.getElementById(`node-${targetIdx}`);
        if (node) {
          node.style.transform = '';
        }
      });
    });
  }

  resetFormula() {
    if (!this.formulaContainer) return;
    this.formulaContainer.innerHTML = `
      <div class="live-calc-header">
        <div class="calc-title">📐 BẢNG TÍNH TOÁN CÔNG THỨC THỜI GIAN THỰC</div>
      </div>
      <div class="calc-body" style="color: var(--text-muted); font-size: 0.95rem;">
        Nhấn <strong>"▶ Chạy tự động"</strong> hoặc <strong>"Bước tiếp ⏭"</strong> để theo dõi từng con số cụ thể được thế vào công thức nội suy ở mỗi lần lặp.
      </div>
    `;
  }

  // Vẽ biểu đồ hình học phong cách Cyberpunk trên Canvas
  drawGeometricPlot(arr, stepData) {
    if (!this.ctx || !this.canvas) return;

    const w = this.displayWidth;
    const h = this.displayHeight;
    const ctx = this.ctx;

    // Nền tối radar công nghệ
    ctx.fillStyle = '#060b13';
    ctx.fillRect(0, 0, w, h);

    const padLeft = 56;
    const padRight = 32;
    const padTop = 32;
    const padBottom = 44;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const n = arr.length;
    const minVal = arr[0];
    const maxVal = arr[n - 1];

    // Helper đổi tọa độ
    const getXCoord = (index) => padLeft + (index / (n - 1)) * plotW;
    const getYCoord = (val) => {
      if (maxVal === minVal) return padTop + plotH / 2;
      return padTop + plotH - ((val - minVal) / (maxVal - minVal)) * plotH;
    };

    // 1. Vẽ lưới tọa độ chấm / sọc mờ tinh tế
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const cx = getXCoord(i);
      ctx.beginPath();
      ctx.moveTo(cx, padTop);
      ctx.lineTo(cx, padTop + plotH);
      ctx.stroke();
    }

    const gridRows = 4;
    for (let r = 0; r <= gridRows; r++) {
      const ry = padTop + (r / gridRows) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, ry);
      ctx.lineTo(padLeft + plotW, ry);
      ctx.stroke();
    }

    // 2. Vẽ đường nối các điểm dữ liệu thực tế arr[i]
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const cx = getXCoord(i);
      const cy = getYCoord(arr[i]);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Vẽ các chấm điểm dữ liệu
    for (let i = 0; i < n; i++) {
      const cx = getXCoord(i);
      const cy = getYCoord(arr[i]);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Nếu đang trong một bước thuật toán
    if (stepData && stepData.low !== undefined && stepData.high !== undefined) {
      const { low, high, pos, x, arrLow, arrHigh } = stepData;

      const lowX = getXCoord(low);
      const lowY = getYCoord(arrLow);

      const highX = getXCoord(high);
      const highY = getYCoord(arrHigh);

      // Vùng tìm kiếm bị loại bỏ được phủ màng tối Sci-Fi Exclusion Mask
      if (low > 0) {
        ctx.fillStyle = 'rgba(2, 6, 14, 0.65)';
        ctx.fillRect(padLeft, padTop, lowX - padLeft, plotH);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(lowX, padTop);
        ctx.lineTo(lowX, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (high < n - 1) {
        ctx.fillStyle = 'rgba(2, 6, 14, 0.65)';
        ctx.fillRect(highX, padTop, padLeft + plotW - highX, plotH);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(highX, padTop);
        ctx.lineTo(highX, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Đường thẳng nội suy với gradient phát sáng (Cyber glow)
      const grad = ctx.createLinearGradient(lowX, lowY, highX, highY);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, '#f59e0b');

      ctx.save();
      ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(lowX, lowY);
      ctx.lineTo(highX, highY);
      ctx.stroke();
      ctx.restore();

      // Vẽ các hạt photon năng lượng di chuyển dọc theo đường nội suy
      const photonFractions = [0.2, 0.45, 0.7, 0.9];
      photonFractions.forEach(frac => {
        const px = lowX + (highX - lowX) * frac;
        const py = lowY + (highY - lowY) * frac;
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Vòng tròn halo cho điểm Low
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.beginPath();
      ctx.arc(lowX, lowY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(lowX, lowY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`low(${low})`, lowX - 16, lowY - 16);

      // Vòng tròn halo cho điểm High
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      ctx.arc(highX, highY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(highX, highY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`high(${high})`, highX - 22, highY - 16);

      // Đường nằm ngang mục tiêu y = x
      const targetY = getYCoord(x);
      ctx.save();
      ctx.shadowColor = 'rgba(236, 72, 153, 0.7)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#ec4899';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padLeft, targetY);
      ctx.lineTo(padLeft + plotW, targetY);
      ctx.stroke();
      ctx.restore();

      // Tag mục tiêu x
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Mục tiêu x = ${x}`, padLeft + 8, targetY - 8);

      // Gióng vuông góc xuống pos và vẽ Holographic Crosshair Target
      if (pos >= 0 && pos < n) {
        const posX = getXCoord(pos);
        ctx.strokeStyle = '#ec4899';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(posX, padTop);
        ctx.lineTo(posX, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Vẽ Holographic Radar Crosshair tại giao điểm
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 18;

        // Vòng ngoài Crosshair
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(posX, targetY, 14, 0, Math.PI * 2);
        ctx.stroke();

        // 4 vạch ngắm chữ thập
        ctx.beginPath();
        ctx.moveTo(posX - 18, targetY); ctx.lineTo(posX - 8, targetY);
        ctx.moveTo(posX + 8, targetY); ctx.lineTo(posX + 18, targetY);
        ctx.moveTo(posX, targetY - 18); ctx.lineTo(posX, targetY - 8);
        ctx.moveTo(posX, targetY + 8); ctx.lineTo(posX, targetY + 18);
        ctx.stroke();

        // Tâm điểm rực sáng
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(posX, targetY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Nhãn HUD khóa mục tiêu
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`🎯 pos = ${pos}`, posX - 28, padTop + plotH + 24);
      }
    }

    // 4. Nhãn trục
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`${minVal}`, 8, padTop + plotH + 4);
    ctx.fillText(`${maxVal}`, 8, padTop + 10);
    ctx.fillText('0', padLeft, padTop + plotH + 18);
    ctx.fillText(`${n - 1}`, padLeft + plotW - 10, padTop + plotH + 18);
    ctx.fillText('Trục chỉ số (Index) →', padLeft + plotW / 2 - 50, padTop + plotH + 34);
  }

  // Tạo toàn bộ bảng vết thực thi
  populateTable(steps) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    steps.forEach((st, idx) => {
      const tr = document.createElement('tr');
      tr.id = `trace-row-${idx}`;

      const posDisplay = st.pos >= 0 ? `<span style="color: var(--pos-color); font-weight: 800;">${st.pos}</span>` : '-';
      const arrPosDisplay = st.arrPos !== null && st.arrPos !== undefined ? `<strong>${st.arrPos}</strong>` : '-';

      tr.innerHTML = `
        <td style="color: #94a3b8;">${st.step}</td>
        <td style="color: var(--low-color); font-weight: 800;">${st.low !== null ? st.low : '-'}</td>
        <td style="color: var(--high-color); font-weight: 800;">${st.high !== null ? st.high : '-'}</td>
        <td>${posDisplay}</td>
        <td>${arrPosDisplay}</td>
        <td style="text-align: left; font-size: 0.84rem; color: #cbd5e1;">${st.action}</td>
      `;

      this.tableBody.appendChild(tr);
    });
  }

  highlightTableRow(currentStepIdx) {
    if (!this.tableBody) return;
    const rows = this.tableBody.querySelectorAll('tr');
    rows.forEach(r => r.classList.remove('current-step'));

    const currentTr = document.getElementById(`trace-row-${currentStepIdx}`);
    if (currentTr) {
      currentTr.classList.add('current-step');
      currentTr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}
