import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId =
      this.configService.get<string>('S3_ACCESS_KEY') || 'AKIASK5MCZBLL42R5ZFA';
    const secretAccessKey =
      this.configService.get<string>('S3_SECRET_KEY') ||
      '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';
    this.bucketName =
      this.configService.get<string>('S3_BUCKET') || 'hrmsecolutionco';
    this.region = this.configService.get<string>('S3_REGION') || 'ap-south-1';
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'avatars',
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const key = `${folder}/${Date.now()}-${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    this.logger.log(`Uploaded file to AWS S3: ${fileUrl}`);
    return fileUrl;
  }
}
