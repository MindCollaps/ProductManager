-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "RepairRequestStatus" AS ENUM ('WAITING_FOR_REVIEW', 'WAITING_FOR_RESPONSE', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('ON_THE_WAY_TO_SHOP', 'RECEIVED', 'IN_DIAGNOSIS', 'WAITING_FOR_PARTS', 'IN_REPAIR', 'IN_QA', 'IN_OUTGOING', 'ON_THE_WAY_TO_CUSTOMER', 'DELIVERED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PartOrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'SHIPPED', 'RECEIVED', 'INSTALLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RepairWorkItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AuthTokenPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purchaseValue" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deviceBrandId" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DeviceBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceCategories" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "DeviceCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedStaffId" TEXT,
    "status" "RepairRequestStatus" NOT NULL DEFAULT 'WAITING_FOR_REVIEW',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "queuePosition" INTEGER,
    "estimatedCompletionAt" TIMESTAMP(3),
    "subject" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceBrand" TEXT,
    "deviceModel" TEXT,
    "serialNumber" TEXT,
    "trackingNumber" TEXT,
    "problemDescription" TEXT NOT NULL,
    "alreadyTried" TEXT,
    "suspectedIssue" TEXT,
    "customerNotes" TEXT,
    "internalSummary" TEXT,
    "rejectedReason" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairDevice" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "deviceId" TEXT,
    "displayName" TEXT NOT NULL,
    "serialNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairStatusHistory" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "deviceId" TEXT,
    "status" "RepairStatus" NOT NULL,
    "customText" TEXT,
    "note" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageChannel" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdById" TEXT,
    "title" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItemType" (
    "id" TEXT NOT NULL,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "laborMinutes" INTEGER,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairMessage" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageChannelParticipant" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "canReply" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageChannelParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairNote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "authorId" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairWorkItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "deviceId" TEXT,
    "createdById" TEXT,
    "assignedStaffId" TEXT,
    "workItemTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "RepairWorkItemStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "laborMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairWorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "sku" TEXT,
    "description" TEXT,
    "unitCost" DECIMAL(12,2),
    "retailPrice" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartOrder" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "deviceId" TEXT,
    "catalogPartId" TEXT,
    "createdById" TEXT,
    "status" "PartOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "orderedName" TEXT NOT NULL,
    "supplierName" TEXT,
    "estimatedCost" DECIMAL(12,2),
    "actualCost" DECIMAL(12,2),
    "savedValue" DECIMAL(12,2),
    "orderedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "installedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairAttachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT,
    "messageChannelId" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "emailDigestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "AuthTokenPurpose" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCategory_name_key" ON "DeviceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCategory_slug_key" ON "DeviceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Device_name_key" ON "Device"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceBrand_name_key" ON "DeviceBrand"("name");

-- CreateIndex
CREATE INDEX "RepairRequest_customerId_status_idx" ON "RepairRequest"("customerId", "status");

-- CreateIndex
CREATE INDEX "RepairRequest_assignedStaffId_status_idx" ON "RepairRequest"("assignedStaffId", "status");

-- CreateIndex
CREATE INDEX "RepairRequest_status_createdAt_idx" ON "RepairRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RepairDevice_requestId_key" ON "RepairDevice"("requestId");

-- CreateIndex
CREATE INDEX "RepairStatusHistory_requestId_startedAt_idx" ON "RepairStatusHistory"("requestId", "startedAt");

-- CreateIndex
CREATE INDEX "RepairStatusHistory_deviceId_startedAt_idx" ON "RepairStatusHistory"("deviceId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageChannel_requestId_key" ON "MessageChannel"("requestId");

-- CreateIndex
CREATE INDEX "MessageChannel_createdById_createdAt_idx" ON "MessageChannel"("createdById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkItemType_name_key" ON "WorkItemType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkItemType_slug_key" ON "WorkItemType"("slug");

-- CreateIndex
CREATE INDEX "WorkItemType_sortOrder_idx" ON "WorkItemType"("sortOrder");

-- CreateIndex
CREATE INDEX "RepairMessage_channelId_createdAt_idx" ON "RepairMessage"("channelId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairMessage_senderId_createdAt_idx" ON "RepairMessage"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageChannelParticipant_userId_lastReadAt_idx" ON "MessageChannelParticipant"("userId", "lastReadAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageChannelParticipant_channelId_userId_key" ON "MessageChannelParticipant"("channelId", "userId");

-- CreateIndex
CREATE INDEX "RepairNote_requestId_createdAt_idx" ON "RepairNote"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairWorkItem_requestId_orderIndex_idx" ON "RepairWorkItem"("requestId", "orderIndex");

-- CreateIndex
CREATE INDEX "RepairWorkItem_deviceId_workItemTypeId_idx" ON "RepairWorkItem"("deviceId", "workItemTypeId");

-- CreateIndex
CREATE INDEX "RepairWorkItem_assignedStaffId_status_idx" ON "RepairWorkItem"("assignedStaffId", "status");

-- CreateIndex
CREATE INDEX "PartCatalog_name_manufacturer_idx" ON "PartCatalog"("name", "manufacturer");

-- CreateIndex
CREATE INDEX "PartCatalog_sku_idx" ON "PartCatalog"("sku");

-- CreateIndex
CREATE INDEX "PartOrder_requestId_status_idx" ON "PartOrder"("requestId", "status");

-- CreateIndex
CREATE INDEX "PartOrder_deviceId_status_idx" ON "PartOrder"("deviceId", "status");

-- CreateIndex
CREATE INDEX "RepairAttachment_requestId_createdAt_idx" ON "RepairAttachment"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_emailDigestSentAt_idx" ON "Notification"("userId", "emailDigestSentAt");

-- CreateIndex
CREATE INDEX "Notification_requestId_createdAt_idx" ON "Notification"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_messageChannelId_createdAt_idx" ON "Notification"("messageChannelId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthToken_userId_purpose_consumedAt_idx" ON "AuthToken"("userId", "purpose", "consumedAt");

-- CreateIndex
CREATE INDEX "AuthToken_expiresAt_idx" ON "AuthToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_deviceBrandId_fkey" FOREIGN KEY ("deviceBrandId") REFERENCES "DeviceBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCategories" ADD CONSTRAINT "DeviceCategories_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCategories" ADD CONSTRAINT "DeviceCategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DeviceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairRequest" ADD CONSTRAINT "RepairRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairRequest" ADD CONSTRAINT "RepairRequest_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDevice" ADD CONSTRAINT "RepairDevice_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairDevice" ADD CONSTRAINT "RepairDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStatusHistory" ADD CONSTRAINT "RepairStatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStatusHistory" ADD CONSTRAINT "RepairStatusHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "RepairDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStatusHistory" ADD CONSTRAINT "RepairStatusHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageChannel" ADD CONSTRAINT "MessageChannel_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageChannel" ADD CONSTRAINT "MessageChannel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItemType" ADD CONSTRAINT "WorkItemType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairMessage" ADD CONSTRAINT "RepairMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "MessageChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairMessage" ADD CONSTRAINT "RepairMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageChannelParticipant" ADD CONSTRAINT "MessageChannelParticipant_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "MessageChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageChannelParticipant" ADD CONSTRAINT "MessageChannelParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairNote" ADD CONSTRAINT "RepairNote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairNote" ADD CONSTRAINT "RepairNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairWorkItem" ADD CONSTRAINT "RepairWorkItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairWorkItem" ADD CONSTRAINT "RepairWorkItem_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "RepairDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairWorkItem" ADD CONSTRAINT "RepairWorkItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairWorkItem" ADD CONSTRAINT "RepairWorkItem_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairWorkItem" ADD CONSTRAINT "RepairWorkItem_workItemTypeId_fkey" FOREIGN KEY ("workItemTypeId") REFERENCES "WorkItemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartOrder" ADD CONSTRAINT "PartOrder_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartOrder" ADD CONSTRAINT "PartOrder_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "RepairDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartOrder" ADD CONSTRAINT "PartOrder_catalogPartId_fkey" FOREIGN KEY ("catalogPartId") REFERENCES "PartCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartOrder" ADD CONSTRAINT "PartOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairAttachment" ADD CONSTRAINT "RepairAttachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairAttachment" ADD CONSTRAINT "RepairAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RepairRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_messageChannelId_fkey" FOREIGN KEY ("messageChannelId") REFERENCES "MessageChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
