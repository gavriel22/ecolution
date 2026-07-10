/**
 * Service untuk upload foto aktivitas dengan ekstraksi EXIF metadata.
 *
 * Flow:
 * 1. Terima multipart/form-data (image + field teks)
 * 2. Extract EXIF dari buffer gambar
 * 3. Jika requireExif=true dan tidak ada metadata → reject
 * 4. Simpan Activity + ActivityPhoto (dengan EXIF) ke DB dalam satu transaksi
 */

import { activityRepository } from "@/repositories/activity.repository";
import { extractExif } from "@/lib/exif";
import { ValidationError, NotFoundError } from "@/utils/errors";
import { ActivityStatus } from "@prisma/client";
import { getPaginationMetadata } from "@/utils/pagination";
import { compressImage } from "@/lib/image";
import { saveUpload } from "@/lib/storage";

// Maksimum ukuran file: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// MIME type yang diizinkan. Semua dinormalisasi menjadi JPEG saat disimpan,
// jadi HEIC (default iPhone), PNG, dan WebP pun aman untuk ditampilkan browser.
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
  "image/tiff",
  "image/png",
  "image/webp",
]);

export interface UploadActivityResult {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  activityDate: Date;
  location: string | null;
  status: ActivityStatus;
  userId: string;
  createdAt: Date;
  photo: {
    id: string;
    imageUrl: string;
    latitude: number | null;
    longitude: number | null;
    takenAt: Date | null;
    hasExif: boolean;
  };
}

export class ActivityUploadService {
  /**
   * Proses upload foto + buat aktivitas baru.
   *
   * @param userId     - ID user dari JWT middleware
   * @param formData   - Parsed FormData dari request
   * @returns          Activity yang baru dibuat beserta data foto
   */
  async uploadActivity(userId: string, formData: FormData): Promise<UploadActivityResult> {
    // ── 1. Ambil & validasi file ─────────────────────────────────────────────
    const file = formData.get("image") as File | null;
    if (!file || typeof file === "string") {
      throw new ValidationError("Field 'image' (file) wajib diisi");
    }

    if (!ALLOWED_MIME.has(file.type)) {
      throw new ValidationError(
        `Tipe file tidak didukung: ${file.type}. Gunakan JPEG, HEIC, atau TIFF`
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(`Ukuran file maksimum adalah 10 MB (dikirim: ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
    }

    // ── 2. Ambil field teks ──────────────────────────────────────────────────
    const title = (formData.get("title") as string | null)?.trim();
    const description = (formData.get("description") as string | null)?.trim() || null;
    const categoryId = (formData.get("categoryId") as string | null)?.trim();
    const activityDateRaw = formData.get("activityDate") as string | null;
    const location = (formData.get("location") as string | null)?.trim() || null;

    if (!title || title.length < 3) {
      throw new ValidationError("'title' wajib diisi dan minimal 3 karakter");
    }
    if (!categoryId) {
      throw new ValidationError("'categoryId' wajib diisi");
    }
    if (!activityDateRaw) {
      throw new ValidationError("'activityDate' wajib diisi (ISO 8601)");
    }

    const activityDate = new Date(activityDateRaw);
    if (isNaN(activityDate.getTime())) {
      throw new ValidationError("'activityDate' tidak valid, gunakan format ISO 8601");
    }

    // ── 3. Validasi kategori ─────────────────────────────────────────────────
    const category = await activityRepository.findCategoryById(categoryId);
    if (!category || !category.isActive) {
      throw new NotFoundError("Kategori aktivitas tidak ditemukan atau tidak aktif");
    }

    // ── 4. Extract EXIF ──────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const exif = await extractExif(buffer);

    // ── 5. Tentukan status berdasarkan EXIF ───────────────────────────────────
    // Jika gambar tidak memiliki GPS dan takenAt → status REJECTED (tidak bisa diverifikasi)
    const status: ActivityStatus = exif.hasExif
      ? ActivityStatus.PENDING
      : ActivityStatus.REJECTED;

    // ── 6. Simpan Activity + Photo ke DB ─────────────────────────────────────
    // Compress & normalize to JPEG for storage. EXIF was already extracted from
    // the original `buffer` above, so stripping metadata here is safe. Storage
    // is portable: Vercel Blob in production, local disk in development.
    const compressed = await compressImage(buffer, { maxSize: 1600, quality: 72 });
    const baseName = file.name.replace(/\.[^./\\]+$/, "").replace(/\s+/g, "_") || "photo";
    const filename = `${Date.now()}-${baseName}${compressed.ext}`;
    const imageUrl = await saveUpload(
      "activities",
      filename,
      compressed.buffer,
      compressed.contentType
    );

    const activity = await activityRepository.create({
      userId,
      categoryId,
      title,
      description: description ?? undefined,
      activityDate,
      location: location ?? undefined,
    });

    // Update status jika tidak ada EXIF
    if (status === ActivityStatus.REJECTED) {
      await activityRepository.update(activity.id, {
        status: ActivityStatus.REJECTED,
        adminNote: "Gambar tidak memiliki metadata EXIF (GPS/waktu pengambilan) yang diperlukan untuk verifikasi",
      });
    }

    const photo = await activityRepository.addPhotoWithExif(activity.id, imageUrl, exif);

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      categoryId: activity.categoryId,
      activityDate: activity.activityDate,
      location: activity.location,
      status,
      userId: activity.userId,
      createdAt: activity.createdAt,
      photo: {
        id: photo.id,
        imageUrl: photo.imageUrl,
        latitude: photo.latitude ?? null,
        longitude: photo.longitude ?? null,
        takenAt: photo.takenAt ?? null,
        hasExif: photo.hasExif,
      },
    };
  }

  /**
   * Ambil daftar aktivitas milik user dengan pagination.
   */
  async listActivities(params: {
    userId: string;
    userRole: string;
    page: number;
    limit: number;
    status?: string;
    search?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;

    // Non-admin hanya bisa lihat aktivitas sendiri
    const targetUserId =
      params.userRole === "ADMIN" ? undefined : params.userId;

    const activities = await activityRepository.findMany({
      skip,
      take: params.limit,
      search: params.search,
      categoryId: params.categoryId,
      status: params.status as any,
      userId: targetUserId,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    const totalCount = await activityRepository.count({
      search: params.search,
      categoryId: params.categoryId,
      status: params.status as any,
      userId: targetUserId,
    });

    return {
      activities,
      meta: getPaginationMetadata(totalCount, params.page, params.limit),
    };
  }
}

export const activityUploadService = new ActivityUploadService();
