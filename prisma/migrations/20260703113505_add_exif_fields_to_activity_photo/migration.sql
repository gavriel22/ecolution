-- AlterTable
ALTER TABLE "activity_photos" ADD COLUMN     "hasExif" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "takenAt" TIMESTAMP(3);
