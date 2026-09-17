/**
 * LOGIC THUẬT TOÁN TÌM KIẾM NỘI SUY (INTERPOLATION SEARCH)
 * & TÌM KIẾM NHỊ PHÂN (BINARY SEARCH) ĐỂ SO SÁNH
 */

// ==========================================
// 1. TÌM KIẾM NỘI SUY (INTERPOLATION SEARCH)
// ==========================================
function generateInterpolationSteps(arr, x) {
  const steps = [];
  let low = 0;
  let high = arr.length - 1;
  let stepCount = 0;

  // Điều kiện dừng:
  // 1. low <= high
  // 2. x >= arr[low] && x <= arr[high]
  while (low <= high && x >= arr[low] && x <= arr[high]) {
    stepCount++;

    const arrLow = arr[low];
    const arrHigh = arr[high];

    // Trường hợp đặc biệt: arr[high] == arr[low] để tránh chia cho 0
    if (arrLow === arrHigh) {
      if (arrLow === x) {
        steps.push({
          step: stepCount,
          low,
          high,
          pos: low,
          arrLow,
          arrHigh,
          arrPos: arrLow,
          x,
          status: 'found',
          formulaCalc: {
            numerator: x - arrLow,
            denominator: 1,
            ratio: 0,
            posOffset: 0,
            calculatedPos: low
          },
          action: `arr[low] == arr[high] == ${x}. Tìm thấy phần tử tại chỉ số ${low}!`,
          foundIndex: low
        });
      } else {
        steps.push({
          step: stepCount,
          low,
          high,
          pos: low,
          arrLow,
          arrHigh,
          arrPos: arrLow,
          x,
          status: 'not_found',
          action: `arr[low] == arr[high] != ${x}. Giá trị không tồn tại trong mảng!`,
          foundIndex: -1
        });
      }
      return steps;
    }

    // Công thức tính vị trí dự đoán pos:
    // pos = low + Math.floor(((x - arr[low]) / (arr[high] - arr[low])) * (high - low))
    const numerator = x - arrLow;
    const denominator = arrHigh - arrLow;
    const ratio = numerator / denominator;
    const posOffset = Math.floor(ratio * (high - low));
    const pos = low + posOffset;

    const arrPos = arr[pos];

    // Bước 1a: Ghi nhận việc tính toán pos
    steps.push({
      step: stepCount,
      subStep: 'calc_pos',
      low,
      high,
      pos,
      arrLow,
      arrHigh,
      arrPos,
      x,
      status: 'calculating',
      formulaCalc: {
        numerator,
        denominator,
        ratio,
        posOffset,
        calculatedPos: pos
      },
      action: `Tính vị trí dự đoán: pos = ${low} + ⌊((${x} - ${arrLow}) / (${arrHigh} - ${arrLow})) × (${high} - ${low})⌋ = ${pos}. Giá trị arr[${pos}] = ${arrPos}.`
    });

    // So sánh arr[pos] với x
    if (arrPos === x) {
      steps.push({
        step: stepCount,
        subStep: 'compare',
        low,
        high,
        pos,
        arrLow,
        arrHigh,
        arrPos,
        x,
        status: 'found',
        formulaCalc: {
          numerator,
          denominator,
          ratio,
          posOffset,
          calculatedPos: pos
        },
        action: `Thành công! arr[${pos}] == ${x}. Đã tìm thấy giá trị tại chỉ số ${pos}!`,
        foundIndex: pos
      });
      return steps;
    }

    if (arrPos < x) {
      steps.push({
        step: stepCount,
        subStep: 'compare',
        low,
        high,
        pos,
        arrLow,
        arrHigh,
        arrPos,
        x,
        status: 'narrow_right',
        formulaCalc: {
          numerator,
          denominator,
          ratio,
          posOffset,
          calculatedPos: pos
        },
        action: `arr[${pos}] (${arrPos}) < ${x} ⇒ Giá trị nằm ở nửa phải. Thu hẹp: low = pos + 1 = ${pos + 1}.`,
        nextLow: pos + 1,
        nextHigh: high
      });
      low = pos + 1;
    } else {
      steps.push({
        step: stepCount,
        subStep: 'compare',
        low,
        high,
        pos,
        arrLow,
        arrHigh,
        arrPos,
        x,
        status: 'narrow_left',
        formulaCalc: {
          numerator,
          denominator,
          ratio,
          posOffset,
          calculatedPos: pos
        },
        action: `arr[${pos}] (${arrPos}) > ${x} ⇒ Giá trị nằm ở nửa trái. Thu hẹp: high = pos - 1 = ${pos - 1}.`,
        nextLow: low,
        nextHigh: pos - 1
      });
      high = pos - 1;
    }
  }

  // Kết thúc nếu không tìm thấy
  stepCount++;
  let reason = '';
  if (low > high) {
    reason = `Khoảng tìm kiếm bị rỗng (low = ${low} > high = ${high}).`;
  } else if (x < arr[low]) {
    reason = `Giá trị cần tìm x = ${x} < arr[low] = ${arr[low]} (nằm ngoài phạm vi nhỏ nhất).`;
  } else if (x > arr[high]) {
    reason = `Giá trị cần tìm x = ${x} > arr[high] = ${arr[high]} (nằm ngoài phạm vi lớn nhất).`;
  }

  steps.push({
    step: stepCount,
    subStep: 'end',
    low,
    high,
    pos: -1,
    arrLow: arr[low] !== undefined ? arr[low] : null,
    arrHigh: arr[high] !== undefined ? arr[high] : null,
    arrPos: null,
    x,
    status: 'not_found',
    action: `Kết thúc: ${reason} Giá trị ${x} KHÔNG tồn tại trong mảng!`,
    foundIndex: -1
  });

  return steps;
}

// ==========================================
// 2. TÌM KIẾM NHỊ PHÂN (BINARY SEARCH) SO SÁNH
// ==========================================
function generateBinarySearchSteps(arr, x) {
  const steps = [];
  let low = 0;
  let high = arr.length - 1;
  let stepCount = 0;

  while (low <= high) {
    stepCount++;
    const mid = Math.floor((low + high) / 2);
    const arrMid = arr[mid];

    if (arrMid === x) {
      steps.push({
        step: stepCount,
        low,
        high,
        mid,
        arrMid,
        status: 'found',
        action: `Tìm thấy ${x} tại mid = ${mid} (arr[${mid}] = ${arrMid})`
      });
      return { steps, foundIndex: mid, totalSteps: stepCount };
    }

    if (arrMid < x) {
      steps.push({
        step: stepCount,
        low,
        high,
        mid,
        arrMid,
        status: 'right',
        action: `arr[${mid}] (${arrMid}) < ${x} ⇒ low = ${mid + 1}`
      });
      low = mid + 1;
    } else {
      steps.push({
        step: stepCount,
        low,
        high,
        mid,
        arrMid,
        status: 'left',
        action: `arr[${mid}] (${arrMid}) > ${x} ⇒ high = ${mid - 1}`
      });
      high = mid - 1;
    }
  }

  return { steps, foundIndex: -1, totalSteps: stepCount };
}

// ==========================================
// 3. TIỆN ÍCH TẠO MẢNG MẪU (PRESETS)
// ==========================================
function generateUniformArray(length = 12, start = 10, step = 8) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(start + i * step);
  }
  return arr;
}

function generateSkewedArray() {
  // Mảng phân bố không đều (tăng nhanh ở cuối)
  return [2, 5, 8, 12, 16, 23, 38, 56, 120, 310, 850, 2000];
}

function generateFibonacciArray() {
  return [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
}

function parseCustomArray(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  
  // Tách theo dấu phẩy, khoảng trắng
  const parts = inputStr.split(/[\s,]+/).filter(Boolean);
  const nums = parts.map(p => Number(p)).filter(n => !isNaN(n));
  
  if (nums.length < 2) {
    return null;
  }
  
  // Sắp xếp tăng dần theo yêu cầu thuật toán
  nums.sort((a, b) => a - b);
  return nums;
}
