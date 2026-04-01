import {
  maxUploadDimensionInPixels,
  targetUploadSizeInBytes,
} from '@/const/chatbot';

export type ChatComposerPart =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'image';
      source: { type: 'data'; value: string; mimeType: string };
    };

export type ChatComposerPayload = string | { content: ChatComposerPart[] };

type ImageUploadPayload = {
  mimeType: string;
  value: string;
};

async function readFileAsDataUrl(file: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Gagal membaca file gambar.'));
    };

    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

async function loadImage(source: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('Gagal memproses file gambar.'));
    image.src = source;
  });
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('Gagal mengompres gambar.'));
      },
      mimeType,
      quality,
    );
  });
}

function getResizedDimensions(width: number, height: number) {
  const longestSide = Math.max(width, height);

  if (longestSide <= maxUploadDimensionInPixels) {
    return { width, height };
  }

  const scale = maxUploadDimensionInPixels / longestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function optimizeImageFile(file: File) {
  if (file.size <= targetUploadSizeInBytes) {
    return file;
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const { width, height } = getResizedDimensions(image.width, image.height);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Browser tidak mendukung kompresi gambar.');
  }

  canvas.width = width;
  canvas.height = height;

  // Fill white background so receipt photos remain readable after JPEG export.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.86;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  let attempt = 0;

  while (blob.size > targetUploadSizeInBytes && attempt < 6) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, 'image/jpeg', Math.max(quality, 0.4));
    attempt += 1;
  }

  if (blob.size > targetUploadSizeInBytes) {
    throw new Error(
      'Foto terlalu besar untuk diproses. Coba crop bagian struk atau kirim gambar yang lebih kecil.',
    );
  }

  const fileNameBase = file.name.replace(/\.[^.]+$/, '') || 'receipt';

  return new File([blob], `${fileNameBase}.jpg`, {
    type: 'image/jpeg',
  });
}

export async function fileToBase64Payload(file: File) {
  const optimizedFile = await optimizeImageFile(file);
  const result = await readFileAsDataUrl(optimizedFile);
  const [, payload] = result.split(',', 2);

  if (!payload) {
    throw new Error('Format file gambar tidak valid.');
  }

  const response: ImageUploadPayload = {
    mimeType: optimizedFile.type || 'image/jpeg',
    value: payload,
  };

  return response;
}
