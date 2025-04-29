-- CreateTable
CREATE TABLE "UserData" (
    "id" TEXT NOT NULL,
    "json" JSONB NOT NULL,

    CONSTRAINT "UserData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceData" (
    "id" TEXT NOT NULL,
    "json" JSONB NOT NULL,

    CONSTRAINT "DeviceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSettings" (
    "id" TEXT NOT NULL,
    "json" JSONB NOT NULL,

    CONSTRAINT "DeviceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceCapture" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "json" JSONB NOT NULL,

    CONSTRAINT "DeviceCapture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceMessage" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "json" JSONB NOT NULL,

    CONSTRAINT "DeviceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceNote" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "json" JSONB NOT NULL,

    CONSTRAINT "DeviceNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairCode" (
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairCode_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "DeviceCapture_deviceId_date_idx" ON "DeviceCapture"("deviceId", "date");

-- CreateIndex
CREATE INDEX "DeviceMessage_deviceId_date_idx" ON "DeviceMessage"("deviceId", "date");

-- CreateIndex
CREATE INDEX "DeviceNote_deviceId_date_idx" ON "DeviceNote"("deviceId", "date");
