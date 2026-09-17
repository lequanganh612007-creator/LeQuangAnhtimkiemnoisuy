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
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
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

    // 2. Cập nhật khối công thức toán học chi tiết kèm thước đo tỷ lệ neon
    this.renderLiveFormula(stepData, currentStepIdx, totalSteps);

    // 3. Vẽ biểu đồ hình học trên Canvas
    this.drawGeometricPlot(arr, stepData);

    // 4. Cập nhật bảng vết
    this.highlightTableRow(currentStepIdx);
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

      // Đường thẳng nội suy với gradient phát sáng (Cyber glow)
      const grad = ctx.createLinearGradient(lowX, lowY, highX, highY);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, '#f59e0b');

      ctx.save();
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lowX, lowY);
      ctx.lineTo(highX, highY);
      ctx.stroke();
      ctx.restore();

      // Vòng tròn halo cho điểm Low
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.beginPath();
      ctx.arc(lowX, lowY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(lowX, lowY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`low(${low})`, lowX - 16, lowY - 14);

      // Vòng tròn halo cho điểm High
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      ctx.arc(highX, highY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(highX, highY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`high(${high})`, highX - 22, highY - 14);

      // Đường nằm ngang mục tiêu y = x
      const targetY = getYCoord(x);
      ctx.save();
      ctx.shadowColor = 'rgba(236, 72, 153, 0.6)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#ec4899';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(padLeft, targetY);
      ctx.lineTo(padLeft + plotW, targetY);
      ctx.stroke();
      ctx.restore();

      // Tag mục tiêu x
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Mục tiêu x = ${x}`, padLeft + 8, targetY - 8);

      // Gióng vuông góc xuống pos
      if (pos >= 0 && pos < n) {
        const posX = getXCoord(pos);
        ctx.strokeStyle = '#ec4899';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(posX, padTop);
        ctx.lineTo(posX, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Điểm giao nội suy pos
        ctx.save();
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(posX, targetY, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Nhãn pos ở đáy trục hoành
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`pos = ${pos}`, posX - 26, padTop + plotH + 22);
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
