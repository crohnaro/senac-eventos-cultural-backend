// src/middlewares/upload.middleware.ts
import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),       // mantém o arquivo em memória
  limits: { fileSize: 5 * 1024 * 1024 }, // até 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas.'));
  }
});
