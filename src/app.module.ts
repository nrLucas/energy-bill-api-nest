import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UploadModule } from "./upload/upload.module";

@Module({
    imports: [UploadModule],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class AppModule {}
