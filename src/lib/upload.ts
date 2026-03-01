import { promises as fs } from "fs";
import path from "path";

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

type SaveUploadOptions = {
  maxBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
};

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveUploadedFile(file: File, folderUnderPublic: string, options: SaveUploadOptions = {}): Promise<string> {
  if (options.maxBytes && file.size > options.maxBytes) {
    const mb = (options.maxBytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
    throw new UploadValidationError(`Ukuran file melebihi batas ${mb}MB.`);
  }

  const ext = path.extname(file.name).toLowerCase() || "";
  if (options.allowedExtensions && options.allowedExtensions.length > 0) {
    const allowedExt = new Set(options.allowedExtensions.map((x) => x.toLowerCase()));
    if (!allowedExt.has(ext)) {
      throw new UploadValidationError("Ekstensi file tidak diizinkan.");
    }
  }

  if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    const mime = file.type.toLowerCase();
    const allowedMime = new Set(options.allowedMimeTypes.map((x) => x.toLowerCase()));
    if (!allowedMime.has(mime)) {
      throw new UploadValidationError("Tipe file tidak diizinkan.");
    }
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extOriginal = path.extname(file.name) || "";
  const base = path.basename(file.name, extOriginal);
  const filename = `${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName(base)}${extOriginal}`;

  const publicDir = path.join(process.cwd(), "public");
  const targetDir = path.join(publicDir, folderUnderPublic);
  await ensureDir(targetDir);

  const targetPath = path.join(targetDir, filename);
  await fs.writeFile(targetPath, buffer);

  return `/${folderUnderPublic}/${filename}`.replace(/\\/g, "/");
}
