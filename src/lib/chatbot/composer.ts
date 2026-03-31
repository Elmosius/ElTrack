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

export async function fileToBase64Payload(file: File) {
  return await new Promise<{ mimeType: string; value: string }>(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result === 'string') {
          const [, payload] = result.split(',', 2);

          if (!payload) {
            reject(new Error('Format file gambar tidak valid.'));
            return;
          }

          resolve({
            mimeType: file.type || 'image/png',
            value: payload,
          });
          return;
        }

        reject(new Error('Gagal membaca file gambar.'));
      };

      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    },
  );
}
