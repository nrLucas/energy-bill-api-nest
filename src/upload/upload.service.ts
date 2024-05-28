import { Injectable } from "@nestjs/common";
import * as pdfParse from "pdf-parse";
import { PrismaService } from "../prisma.service";

@Injectable()
export class UploadService {
    constructor(private readonly prisma: PrismaService) {}

    async extractDataFromPdf(file: Express.Multer.File) {
        const dataBuffer = file.buffer;
        const data = await pdfParse(dataBuffer);
        const text = data.text;

        const extractedData = {
            customerNumber: this.extractField(text, "Nº DO CLIENTE", "number"),
            referenceMonth: this.extractField(text, "Referente a", "month"),
            electricEnergyQuantity: this.extractField(text, "Energia ElétricakWh", "number"),
            electricEnergyValue: this.extractField(text, "Energia ElétricakWh", "valueAfterQuantity"),
            sceeeEnergyQuantity: this.extractField(text, "Energia SCEE ISENTAkWh", "number"),
            sceeeEnergyValue: this.extractField(text, "Energia SCEE ISENTAkWh", "valueAfterQuantity"),
            compensatedEnergyQuantity: this.extractField(text, "Energia compensada GD IkWh", "number"),
            compensatedEnergyValue: this.extractField(text, "Energia compensada GD IkWh", "valueAfterQuantity"),
            publicLightingContribution: this.extractField(text, "Contrib Ilum Publica Municipal", "value"),
        };

        return extractedData;
    }

    extractField(text: string, fieldName: string, patternType: "number" | "value" | "month" | "custom" | "valueAfterQuantity", customPattern?: RegExp): string {
        let regex: RegExp;

        switch (patternType) {
            case "number":
                regex = new RegExp(`${fieldName}.*?(\\d+)`, "s");
                break;
            case "value":
                regex = new RegExp(`${fieldName}.*?(\\d{1,3}(?:\\.\\d{3})*,\\d{2})`, "s");
                break;
            case "month":
                regex = new RegExp(`${fieldName}.*?([A-Z]{3}/\\d{4})`, "s");
                break;
            case "valueAfterQuantity":
                regex = new RegExp(`${fieldName}\\s+\\d+\\s+\\d+,\\d+\\s+(-?\\d{1,3}(?:\\.\\d{3})*,\\d{2})`, "s");
                break;
            case "custom":
                if (customPattern) {
                    regex = customPattern;
                } else {
                    return "";
                }
                break;
            default:
                return "";
        }

        const match = text.match(regex);
        if (match) {
            console.log("match", match);
            return match[1];
        }
        return "";
    }

    async saveData(data: any) {
        return this.prisma.energyBill.create({
            data: {
                customerNumber: data.customerNumber,
                referenceMonth: data.referenceMonth,
                electricEnergyQuantity: data.electricEnergyQuantity,
                electricEnergyValue: data.electricEnergyValue,
                sceeeEnergyQuantity: data.sceeeEnergyQuantity,
                sceeeEnergyValue: data.sceeeEnergyValue,
                compensatedEnergyQuantity: data.compensatedEnergyQuantity,
                compensatedEnergyValue: data.compensatedEnergyValue,
                publicLightingContribution: data.publicLightingContribution,
            },
        });
    }
}
