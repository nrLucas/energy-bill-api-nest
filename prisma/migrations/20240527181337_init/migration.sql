-- CreateTable
CREATE TABLE "EnergyBill" (
    "id" SERIAL NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "electricEnergyQuantity" TEXT NOT NULL,
    "electricEnergyValue" TEXT NOT NULL,
    "sceeeEnergyQuantity" TEXT NOT NULL,
    "sceeeEnergyValue" TEXT NOT NULL,
    "compensatedEnergyQuantity" TEXT NOT NULL,
    "compensatedEnergyValue" TEXT NOT NULL,
    "publicLightingContribution" TEXT NOT NULL,

    CONSTRAINT "EnergyBill_pkey" PRIMARY KEY ("id")
);
