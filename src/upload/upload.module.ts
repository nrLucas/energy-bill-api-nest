/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { memoryStorage } from "multer";
import { PrismaService } from "../prisma.service";

@Module({
    imports: [
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    providers: [UploadService, PrismaService], // Adicione PrismaService aos providers
    controllers: [UploadController],
})
export class UploadModule {}

