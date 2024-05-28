import { Controller, Get, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { PrismaService } from "../prisma.service";

@Controller("upload")
export class UploadController {
    constructor(
        private readonly uploadService: UploadService,
        private readonly prisma: PrismaService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor("file"))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const extractedData = await this.uploadService.extractDataFromPdf(file);
        if (extractedData) console.log("extractedData", extractedData);

        // Verificar se todos os valores do objeto são vazios
        if (isEmptyObject(extractedData)) {
            return {
                success: false,
                message: "Não foi possível extrair nenhum dado do PDF enviado",
            };
        }

        const savedData = await this.uploadService.saveData(extractedData);
        return {
            success: true,
            data: savedData,
        };
    }

    @Get("aggregated-data")
    async getAggregatedData() {
        const records = await this.prisma.energyBill.findMany();

        const aggregatedData = {
            totalElectricEnergyConsumption: 0,
            totalCompensatedEnergy: 0,
            totalValueWithoutGD: 0,
            totalGDSavings: 0,
            monthlyElectricEnergyConsumption: Array(12).fill(0),
            monthlyCompensatedEnergy: Array(12).fill(0),
            monthlyValueWithoutGD: Array(12).fill(0),
            monthlyGDSavings: Array(12).fill(0),
        };

        const monthMap = {
            JAN: 0,
            FEV: 1,
            MAR: 2,
            ABR: 3,
            MAI: 4,
            JUN: 5,
            JUL: 6,
            AGO: 7,
            SET: 8,
            OUT: 9,
            NOV: 10,
            DEZ: 11,
        };

        records.forEach((record) => {
            const monthString = record.referenceMonth.split("/")[0].toUpperCase();
            const monthIndex = monthMap[monthString];

            const electricEnergyQuantity = parseFloat(record.electricEnergyQuantity.replace(".", "").replace(",", ".")) || 0;
            const sceeeEnergyQuantity = parseFloat(record.sceeeEnergyQuantity.replace(".", "").replace(",", ".")) || 0;
            const compensatedEnergyQuantity = parseFloat(record.compensatedEnergyQuantity.replace(".", "").replace(",", ".")) || 0;
            const electricEnergyValue = parseFloat(record.electricEnergyValue.replace(".", "").replace(",", ".")) || 0;
            const sceeeEnergyValue = parseFloat(record.sceeeEnergyValue.replace(".", "").replace(",", ".")) || 0;
            const compensatedEnergyValue = parseFloat(record.compensatedEnergyValue.replace(".", "").replace(",", ".")) || 0;
            const publicLightingContribution = parseFloat(record.publicLightingContribution.replace(".", "").replace(",", ".")) || 0;

            aggregatedData.totalElectricEnergyConsumption += electricEnergyQuantity + sceeeEnergyQuantity;
            aggregatedData.totalCompensatedEnergy += compensatedEnergyQuantity;
            aggregatedData.totalValueWithoutGD += electricEnergyValue + sceeeEnergyValue + publicLightingContribution;
            aggregatedData.totalGDSavings += compensatedEnergyValue;

            aggregatedData.monthlyElectricEnergyConsumption[monthIndex] += electricEnergyQuantity + sceeeEnergyQuantity;
            aggregatedData.monthlyCompensatedEnergy[monthIndex] += compensatedEnergyQuantity;
            aggregatedData.monthlyValueWithoutGD[monthIndex] += electricEnergyValue + sceeeEnergyValue + publicLightingContribution;
            aggregatedData.monthlyGDSavings[monthIndex] += compensatedEnergyValue;
        });

        return aggregatedData;
    }
}

// Função utilitária para verificar se todos os valores do objeto são vazios
function isEmptyObject(obj: Record<string, any>): boolean {
    return Object.values(obj).every((value) => value === "");
}
