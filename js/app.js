/**
 * ỨNG DỤNG ĐIỀU KHIỂN CHÍNH (MAIN CONTROLLER) - NÂNG CẤP CAO CẤP
 * - Web Audio API Synthetic Sound Effects (Offline 100%, không cần file tải)
 * - Keyboard Shortcuts (Phím cách Play/Pause, Mũi tên trái/phải)
 * - Visual Duel Mode Progress Bars
 * - Interactive Quiz & Code Tabs
 */

// Bộ code mẫu đa ngôn ngữ chuẩn DSA
const CODE_SNIPPETS = {
  cpp: `// ==========================================
// CÀI ĐẶT TÌM KIẾM NỘI SUY (C++)
// Độ phức tạp trung bình: O(log(log n))
// ==========================================
#include <iostream>
#include <vector>

using namespace std;

int interpolationSearch(const vector<int>& arr, int x) {
    int low = 0;
    int high = arr.size() - 1;

    // Điều kiện dừng: low <= high và x nằm trong phạm vi [arr[low], arr[high]]
    while (low <= high && x >= arr[low] && x <= arr[high]) {
        // Trường hợp 2 đầu bằng nhau tránh chia cho 0
        if (arr[low] == arr[high]) {
            if (arr[low] == x) return low;
            return -1;
        }

        // Công thức tính vị trí nội suy pos:
        // pos = low + [ (x - arr[low]) / (arr[high] - arr[low]) ] * (high - low)
        int pos = low + (((double)(x - arr[low]) / (arr[high] - arr[low])) * (high - low));

        // Kiểm tra phần tử dự đoán
        if (arr[pos] == x)
            return pos; // Tìm thấy!

        // Thu hẹp phạm vi tìm kiếm
        if (arr[pos] < x)
            low = pos + 1;  // Tìm ở nửa bên phải
        else
            high = pos - 1; // Tìm ở nửa bên trái
    }

    return -1; // Không tìm thấy
}

int main() {
    vector<int> arr = {10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90};
    int x = 58;
    int index = interpolationSearch(arr, x);

    if (index != -1)
        cout << "Tìm thấy " << x << " tại chỉ số: " << index << endl;
    else
        cout << "Không tìm thấy " << x << " trong mảng!" << endl;

    return 0;
}`,

  python: `# ==========================================
# CÀI ĐẶT TÌM KIẾM NỘI SUY (PYTHON)
# Độ phức tạp trung bình: O(log(log n))
# ==========================================
def interpolation_search(arr, x):
    low = 0
    high = len(arr) - 1

    # Điều kiện dừng: low <= high và x nằm trong khoảng [arr[low], arr[high]]
    while low <= high and x >= arr[low] and x <= arr[high]:
        # Tránh lỗi chia cho 0 khi 2 đầu bằng nhau
        if arr[low] == arr[high]:
            if arr[low] == x:
                return low
            return -1

        # Áp dụng công thức tìm vị trí ước lượng pos
        ratio = (x - arr[low]) / (arr[high] - arr[low])
        pos = low + int(ratio * (high - low))

        # So sánh phần tử tại pos
        if arr[pos] == x:
            return pos  # Tìm thấy!

        # Thu hẹp phạm vi tìm kiếm
        if arr[pos] < x:
            low = pos + 1
        else:
            high = pos - 1

    return -1  # Không tìm thấy


if __name__ == "__main__":
    data = [10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90]
    target = 58
    result = interpolation_search(data, target)
    print(f"Kết quả tìm {target}: Chỉ số = {result}")`,

  java: `// ==========================================
// CÀI ĐẶT TÌM KIẾM NỘI SUY (JAVA)
// Độ phức tạp trung bình: O(log(log n))
// ==========================================
public class InterpolationSearch {

    public static int search(int[] arr, int x) {
        int low = 0;
        int high = arr.length - 1;

        while (low <= high && x >= arr[low] && x <= arr[high]) {
            // Xử lý đặc biệt tránh chia cho 0
            if (arr[low] == arr[high]) {
                if (arr[low] == x) return low;
                return -1;
            }

            // Công thức ước lượng pos
            int pos = low + (int)(((double)(x - arr[low]) / (arr[high] - arr[low])) * (high - low));

            if (arr[pos] == x) {
                return pos; // Tìm thấy
            }

            if (arr[pos] < x) {
                low = pos + 1; // Thu hẹp sang phải
            } else {
                high = pos - 1; // Thu hẹp sang trái
            }
        }

        return -1; // Không tìm thấy
    }

    public static void main(String[] args) {
        int[] arr = {10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90};
        int x = 58;
        int result = search(arr, x);
        System.out.println("Tìm thấy tại vị trí: " + result);
    }
}`,

  javascript: `// ==========================================
// CÀI ĐẶT TÌM KIẾM NỘI SUY (JAVASCRIPT)
// Độ phức tạp trung bình: O(log(log n))
// ==========================================
function interpolationSearch(arr, x) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high && x >= arr[low] && x <= arr[high]) {
    // Tránh lỗi chia cho 0
    if (arr[low] === arr[high]) {
      return arr[low] === x ? low : -1;
    }

    // Công thức tính vị trí ước lượng pos
    const ratio = (x - arr[low]) / (arr[high] - arr[low]);
    const pos = low + Math.floor(ratio * (high - low));

    if (arr[pos] === x) {
      return pos; // Tìm thấy
    }

    if (arr[pos] < x) {
      low = pos + 1; // Thu hẹp sang phải
    } else {
      high = pos - 1; // Thu hẹp sang trái
    }
  }

  return -1; // Không tìm thấy
}`
};

// Dữ liệu câu hỏi trắc nghiệm
const QUIZ_DATA = [
  {
    question: "Độ phức tạp thời gian trung bình của Thuật toán Tìm kiếm Nội suy khi dữ liệu phân bố đều là bao nhiêu?",
    options: [
      "O(n)",
      "O(log n)",
      "O(log(log n))",
      "O(1)"
    ],
    correct: 2,
    explanation: "Chính xác! Khi dữ liệu phân bố đồng đều (Uniform Distribution), kích thước bài toán giảm theo cấp số nhân kép ở mỗi vòng lặp, mang lại độ phức tạp cực nhanh là O(log(log n))."
  },
  {
    question: "Trong công thức pos = low + ⌊((x - arr[low]) / (arr[high] - arr[low])) * (high - low)⌋, phân số ((x - arr[low]) / (arr[high] - arr[low])) biểu thị điều gì?",
    options: [
      "Số phần tử của mảng",
      "Tỷ lệ phần trăm vị trí tương đối của giá trị x trong dải giá trị từ arr[low] đến arr[high]",
      "Vận tốc tìm kiếm",
      "Chỉ số phần tử ở chính giữa mảng"
    ],
    correct: 1,
    explanation: "Chính xác! Phân số này đo lường tỷ lệ khoảng cách của x tính từ mốc arr[low] so với toàn bộ độ dài dải giá trị [arr[low], arr[high]]."
  },
  {
    question: "Trường hợp xấu nhất (Worst-case) của Tìm kiếm Nội suy xảy ra khi nào và có độ phức tạp là bao nhiêu?",
    options: [
      "Khi dữ liệu phân bố đều; O(log n)",
      "Khi dữ liệu tăng theo cấp số nhân hoặc bị lệch nghiêm trọng; O(n)",
      "Khi giá trị x nằm ở chính giữa mảng; O(1)",
      "Khi mảng có kích thước rất lớn; O(n^2)"
    ],
    correct: 1,
    explanation: "Chính xác! Khi dữ liệu phân bố lệch (ví dụ 1, 2, 4, 8, 16, 100000), thuật toán sẽ liên tục ước lượng sai vị trí và chỉ dịch con trỏ từng bước 1 đơn vị, dẫn đến suy biến về O(n)."
  },
  {
    question: "Điều kiện tiên quyết bắt buộc để áp dụng thuật toán Tìm kiếm Nội suy là gì?",
    options: [
      "Mảng đã được sắp xếp tăng dần và phần tử là kiểu số",
      "Mảng có độ dài là lũy thừa của 2",
      "Mảng không được chứa số âm",
      "Mảng phải có ít nhất 1000 phần tử"
    ],
    correct: 0,
    explanation: "Chính xác! Giống như tìm kiếm nhị phân, mảng bắt buộc phải được sắp xếp thì phép nội suy tính toán tỷ lệ vị trí mới có cơ sở toán học."
  }
];

// ==========================================
// BỘ PHÁT ÂM THANH SYNTHETIC (WEB AUDIO API)
// ==========================================
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playStepSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  playFoundSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - High C
      notes.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + i * 0.08);
        osc.stop(this.audioCtx.currentTime + i * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  playNotFoundSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch (e) {}
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  // Trạng thái ban đầu
  let currentArray = generateUniformArray(12, 10, 8); // [10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90, 98]
  let targetX = 58;
  let steps = [];
  let currentStepIdx = -1;
  let timer = null;
  let playSpeed = 1200; // ms

  const sound = new SoundManager();

  // Khởi tạo visualizer
  const visualizer = new Visualizer(
    'arrayNodesContainer',
    'liveFormulaBox',
    'interpolationCanvas',
    'stepLogTableBody'
  );

  // Tương tác nhấp trực tiếp vào ô mảng để tự động tìm kiếm giá trị đó
  visualizer.onSelectTarget = (selectedVal) => {
    targetX = selectedVal;
    if (targetXInput) targetXInput.value = selectedVal;
    sound.playStepSound();
    initSimulation();
    startAutoPlay();
  };

  // DOM Elements
  const customArrayInput = document.getElementById('customArrayInput');
  const targetXInput = document.getElementById('targetXInput');
  const btnApplyArray = document.getElementById('btnApplyArray');
  const btnPlay = document.getElementById('btnPlay');
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnReset = document.getElementById('btnReset');
  const speedSlider = document.getElementById('speedSlider');
  const speedLabel = document.getElementById('speedLabel');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  // Nạp mảng mặc định vào input
  customArrayInput.value = currentArray.join(', ');
  targetXInput.value = targetX;

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      if (sound.enabled) {
        soundToggleBtn.classList.add('active');
        soundToggleBtn.innerHTML = '🔊 Âm thanh: Bật';
      } else {
        soundToggleBtn.classList.remove('active');
        soundToggleBtn.innerHTML = '🔇 Âm thanh: Tắt';
      }
    });
  }

  // Khởi tạo lại các bước
  function initSimulation() {
    pauseAutoPlay();
    steps = generateInterpolationSteps(currentArray, targetX);
    currentStepIdx = -1;
    visualizer.renderInitialArray(currentArray);
    visualizer.populateTable(steps);
    updateButtonStates();
    runDuelComparison();
  }

  // Cập nhật trạng thái các nút
  function updateButtonStates() {
    btnPrev.disabled = currentStepIdx <= 0;
    btnNext.disabled = currentStepIdx >= steps.length - 1;
    btnPlay.disabled = currentStepIdx >= steps.length - 1;

    if (timer) {
      btnPlay.innerHTML = '⏸ Tạm dừng';
      btnPlay.classList.add('btn-secondary');
      btnPlay.classList.remove('btn-primary');
    } else {
      btnPlay.innerHTML = '▶ Chạy tự động';
      btnPlay.classList.add('btn-primary');
      btnPlay.classList.remove('btn-secondary');
    }
  }

  // Chuyển sang bước kế tiếp
  function stepForward() {
    if (currentStepIdx < steps.length - 1) {
      currentStepIdx++;
      const currentStep = steps[currentStepIdx];

      visualizer.renderStep(
        currentArray,
        currentStep,
        currentStepIdx,
        steps.length
      );

      // Phát âm thanh và pháo hoa hạt sáng tương ứng
      if (currentStep.status === 'found') {
        sound.playFoundSound();
        if (window.confettiCannon) {
          window.confettiCannon.burst();
        }
      } else if (currentStep.status === 'not_found') {
        sound.playNotFoundSound();
      } else {
        sound.playStepSound();
      }

      updateButtonStates();
      return true;
    } else {
      pauseAutoPlay();
      updateButtonStates();
      return false;
    }
  }

  // Lùi lại bước trước
  function stepBackward() {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      visualizer.renderStep(
        currentArray,
        steps[currentStepIdx],
        currentStepIdx,
        steps.length
      );
      sound.playStepSound();
      updateButtonStates();
    } else if (currentStepIdx === 0) {
      currentStepIdx = -1;
      visualizer.renderInitialArray(currentArray);
      updateButtonStates();
    }
  }

  // Tự động chạy
  function startAutoPlay() {
    if (currentStepIdx >= steps.length - 1) {
      currentStepIdx = -1;
    }
    timer = setInterval(() => {
      const hasNext = stepForward();
      if (!hasNext) {
        pauseAutoPlay();
      }
    }, playSpeed);
    updateButtonStates();
  }

  function pauseAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      updateButtonStates();
    }
  }

  // Bắt sự kiện phím tắt
  window.addEventListener('keydown', (e) => {
    // Tránh can thiệp khi đang gõ vào input
    if (e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (timer) pauseAutoPlay();
      else startAutoPlay();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      pauseAutoPlay();
      stepForward();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      pauseAutoPlay();
      stepBackward();
    }
  });

  // Sự kiện nút bấm giao diện
  btnPlay.addEventListener('click', () => {
    if (timer) pauseAutoPlay();
    else startAutoPlay();
  });

  btnNext.addEventListener('click', () => {
    pauseAutoPlay();
    stepForward();
  });

  btnPrev.addEventListener('click', () => {
    pauseAutoPlay();
    stepBackward();
  });

  btnReset.addEventListener('click', () => {
    initSimulation();
  });

  speedSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    playSpeed = 2600 - val;
    speedLabel.textContent = `${(val / 1000).toFixed(1)}x`;
    if (timer) {
      pauseAutoPlay();
      startAutoPlay();
    }
  });

  // Áp dụng mảng tùy biến
  btnApplyArray.addEventListener('click', () => {
    const parsed = parseCustomArray(customArrayInput.value);
    if (!parsed) {
      alert('Vui lòng nhập danh sách ít nhất 2 số hợp lệ, cách nhau bằng dấu phẩy hoặc khoảng trắng!');
      return;
    }
    const xVal = Number(targetXInput.value);
    if (isNaN(xVal)) {
      alert('Vui lòng nhập giá trị x cần tìm là một số hợp lệ!');
      return;
    }

    currentArray = parsed;
    targetX = xVal;
    customArrayInput.value = currentArray.join(', ');
    initSimulation();
  });

  // Presets buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.preset;
      if (type === 'uniform') {
        currentArray = generateUniformArray(12, 10, 8);
        targetX = 58;
      } else if (type === 'skewed') {
        currentArray = generateSkewedArray();
        targetX = 120;
      } else if (type === 'fibonacci') {
        currentArray = generateFibonacciArray();
        targetX = 34;
      }
      customArrayInput.value = currentArray.join(', ');
      targetXInput.value = targetX;
      initSimulation();
    });
  });

  // ==========================================
  // SO SÁNH ĐỐI ĐẦU: INTERPOLATION VS BINARY
  // ==========================================
  function runDuelComparison() {
    const interRes = generateInterpolationSteps(currentArray, targetX);
    const binRes = generateBinarySearchSteps(currentArray, targetX);

    const interStepCount = interRes.length;
    const binStepCount = binRes.totalSteps;

    const interCountEl = document.getElementById('interStepCount');
    const binCountEl = document.getElementById('binStepCount');
    const duelSummaryEl = document.getElementById('duelSummaryText');
    const interCard = document.getElementById('duelInterCard');
    const binCard = document.getElementById('duelBinCard');

    const interBar = document.getElementById('interBarFill');
    const binBar = document.getElementById('binBarFill');

    if (interCountEl) interCountEl.textContent = `${interStepCount} bước`;
    if (binCountEl) binCountEl.textContent = `${binStepCount} bước`;

    if (interCard) interCard.classList.remove('winner');
    if (binCard) binCard.classList.remove('winner');

    // Cập nhật thanh so sánh trực quan
    const maxSteps = Math.max(interStepCount, binStepCount, 1);
    if (interBar) interBar.style.width = `${Math.min(100, (interStepCount / maxSteps) * 100)}%`;
    if (binBar) binBar.style.width = `${Math.min(100, (binStepCount / maxSteps) * 100)}%`;

    if (interStepCount < binStepCount) {
      if (interCard) interCard.classList.add('winner');
      if (duelSummaryEl) {
        duelSummaryEl.innerHTML = `🏆 <strong>Interpolation Search thắng áp đảo!</strong> Hoàn thành chỉ trong <strong>${interStepCount} bước</strong> so với ${binStepCount} bước của Binary Search. Nhờ dữ liệu phân bố đều nên ước lượng vị trí $pos$ gần trúng đích ngay lập tức.`;
      }
    } else if (interStepCount > binStepCount) {
      if (binCard) binCard.classList.add('winner');
      if (duelSummaryEl) {
        duelSummaryEl.innerHTML = `🏆 <strong>Binary Search thắng!</strong> Hoàn thành trong <strong>${binStepCount} bước</strong> so với ${interStepCount} bước của Interpolation Search. Nguyên nhân: Mảng phân bố không đồng đều (bị lệch) khiến phép nội suy tuyến tính ước tính sai vị trí nhiều lần.`;
      }
    } else {
      if (duelSummaryEl) {
        duelSummaryEl.innerHTML = `🤝 <strong>Hòa nhau!</strong> Cả hai thuật toán đều hoàn thành với cùng <strong>${interStepCount} bước</strong> so sánh.`;
      }
    }
  }

  // ==========================================
  // CODE TABS & COPY CODE
  // ==========================================
  const codeContentEl = document.getElementById('codeSnippetArea');
  const codeLangTag = document.getElementById('codeLangTag');
  const btnCopyCode = document.getElementById('btnCopyCode');

  function renderCode(lang) {
    if (codeContentEl && CODE_SNIPPETS[lang]) {
      codeContentEl.textContent = CODE_SNIPPETS[lang];
      if (codeLangTag) codeLangTag.textContent = lang.toUpperCase();
    }
  }

  document.querySelectorAll('.code-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.code-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCode(tab.dataset.lang);
    });
  });

  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      if (!codeContentEl) return;
      navigator.clipboard.writeText(codeContentEl.textContent).then(() => {
        const originalText = btnCopyCode.innerHTML;
        btnCopyCode.innerHTML = '✔ Đã sao chép!';
        setTimeout(() => {
          btnCopyCode.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  // ==========================================
  // QUIZ TRẮC NGHIỆM TƯƠNG TÁC
  // ==========================================
  const quizContainer = document.getElementById('quizQuestionsContainer');
  const quizScoreBanner = document.getElementById('quizScoreBanner');
  let userAnswers = {};

  function renderQuiz() {
    if (!quizContainer) return;
    quizContainer.innerHTML = '';

    QUIZ_DATA.forEach((q, qIdx) => {
      const qItem = document.createElement('div');
      qItem.className = 'quiz-question-item';

      const qTitle = document.createElement('div');
      qTitle.className = 'quiz-q-title';
      qTitle.innerHTML = `<span class="quiz-q-num">Câu ${qIdx + 1}:</span> ${q.question}`;
      qItem.appendChild(qTitle);

      const optList = document.createElement('div');
      optList.className = 'quiz-options';

      q.options.forEach((optText, optIdx) => {
        const optBtn = document.createElement('div');
        optBtn.className = 'quiz-opt';
        optBtn.dataset.q = qIdx;
        optBtn.dataset.opt = optIdx;
        optBtn.innerHTML = `<strong>${String.fromCharCode(65 + optIdx)}.</strong> ${optText}`;

        optBtn.addEventListener('click', () => handleQuizSelect(qIdx, optIdx, qItem));
        optList.appendChild(optBtn);
      });

      qItem.appendChild(optList);

      const expBox = document.createElement('div');
      expBox.className = 'quiz-explanation';
      expBox.id = `quiz-exp-${qIdx}`;
      qItem.appendChild(expBox);

      quizContainer.appendChild(qItem);
    });
  }

  function handleQuizSelect(qIdx, optIdx, qItem) {
    const qData = QUIZ_DATA[qIdx];
    userAnswers[qIdx] = optIdx;

    const optBtns = qItem.querySelectorAll('.quiz-opt');
    optBtns.forEach(b => {
      b.classList.remove('selected', 'correct', 'incorrect');
      b.style.pointerEvents = 'none';
    });

    const selectedBtn = qItem.querySelector(`[data-opt="${optIdx}"]`);
    const correctBtn = qItem.querySelector(`[data-opt="${qData.correct}"]`);

    if (optIdx === qData.correct) {
      if (selectedBtn) selectedBtn.classList.add('correct');
      sound.playFoundSound();
    } else {
      if (selectedBtn) selectedBtn.classList.add('incorrect');
      if (correctBtn) correctBtn.classList.add('correct');
      sound.playNotFoundSound();
    }

    const expBox = document.getElementById(`quiz-exp-${qIdx}`);
    if (expBox) {
      expBox.innerHTML = `<strong>Giải thích:</strong> ${qData.explanation}`;
      expBox.classList.add('show');
    }

    checkAllQuizAnswered();
  }

  function checkAllQuizAnswered() {
    if (Object.keys(userAnswers).length === QUIZ_DATA.length) {
      let score = 0;
      QUIZ_DATA.forEach((q, idx) => {
        if (userAnswers[idx] === q.correct) score++;
      });
      if (quizScoreBanner) {
        quizScoreBanner.style.display = 'block';
        quizScoreBanner.innerHTML = `
          <h3>🎉 Hoàn thành xuất sắc bài trắc nghiệm!</h3>
          <p style="font-size: 1.25rem; margin-top: 10px;">
            Điểm số của bạn: <strong style="color: var(--accent-cyan); font-size: 1.5rem;">${score} / ${QUIZ_DATA.length}</strong> (${Math.round((score / QUIZ_DATA.length) * 100)}%)
          </p>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 6px;">
            ${score === QUIZ_DATA.length ? 'Xuất sắc! Bạn đã nắm vững 100% bản chất thuật toán Tìm kiếm Nội suy.' : 'Rất tốt! Hãy xem lại các câu trả lời và lời giải thích bên trên để ghi nhớ sâu hơn nhé.'}
          </p>
        `;
        quizScoreBanner.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Khởi chạy
  renderCode('cpp');
  initSimulation();
  renderQuiz();

  // ==========================================
  // SCROLL REVEAL ANIMATION SYSTEM
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // Kích hoạt ngay các phần tử đã nằm trong màn hình ban đầu
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('revealed');
    }
  });
});
