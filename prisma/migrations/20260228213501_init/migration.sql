-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "brandNameDisplay" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "foundedYear" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "whatsappWaMe" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "serviceHours" TEXT NOT NULL,
    "socialTikTok" TEXT NOT NULL,
    "socialFacebook" TEXT NOT NULL,
    "socialInstagram" TEXT,
    "instagramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "donationBankName" TEXT NOT NULL,
    "donationAccountNumber" TEXT NOT NULL,
    "donationAccountHolder" TEXT NOT NULL,
    "homeHeadline" TEXT NOT NULL,
    "homeSubheadline" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "mapsEmbedIframe" TEXT NOT NULL,
    "legalDocPdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imagePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImagePath" TEXT,
    "publishedAt" TIMESTAMP(3),
    "contentMarkdown" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "incomePdfPath" TEXT,
    "expensePdfPath" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "positionTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoPath" TEXT,
    "whatsapp" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GkoinDusun" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GkoinDusun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GkoinDeposit" (
    "id" TEXT NOT NULL,
    "dusunId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "inputDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GkoinDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_month_year_key" ON "MonthlyReport"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "GkoinDusun_name_key" ON "GkoinDusun"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GkoinDeposit_dusunId_month_year_key" ON "GkoinDeposit"("dusunId", "month", "year");

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GkoinDeposit" ADD CONSTRAINT "GkoinDeposit_dusunId_fkey" FOREIGN KEY ("dusunId") REFERENCES "GkoinDusun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
