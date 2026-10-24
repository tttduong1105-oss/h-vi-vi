const MAX_DATA_URL_LENGTH = 235000;

/**
 * Compresses an uploaded image file on an HTML5 Canvas so it remains sharp
 * while strictly staying under our Firestore 250,000-character security rule ceiling.
 */
export async function compressImageForMailbox(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP, GIF).');
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Kích thước ảnh gốc tối đa 12MB.');
  }

  const bitmapUrl = await readFileAsDataUrl(file);
  const img = await loadImage(bitmapUrl);

  const attempts: { maxDim: number; quality: number }[] = [
    { maxDim: 920, quality: 0.8 },
    { maxDim: 780, quality: 0.72 },
    { maxDim: 640, quality: 0.64 },
    { maxDim: 520, quality: 0.56 },
  ];

  for (const { maxDim, quality } of attempts) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
    const targetW = Math.max(1, Math.round(img.width * scale));
    const targetH = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Trình duyệt không hỗ trợ xử lý hình ảnh.');
    }

    // Fill soft white background in case of transparent PNGs converted to JPEG
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const compressed = canvas.toDataURL('image/jpeg', quality);
    if (compressed.length <= MAX_DATA_URL_LENGTH) {
      return compressed;
    }
  }

  throw new Error('Ảnh có độ chi tiết quá lớn, vui lòng chọn một bức ảnh nhẹ hơn nhé.');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Tệp hình ảnh bị lỗi hoặc không được hỗ trợ.'));
    img.src = src;
  });
}
