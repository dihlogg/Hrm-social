import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/upload/');
      if (parts.length !== 2) return null;

      const pathWithoutVersion = parts[1].replace(/^v\d+\//, '');
      const lastDotIndex = pathWithoutVersion.lastIndexOf('.');
      if (lastDotIndex === -1) return pathWithoutVersion;

      return pathWithoutVersion.substring(0, lastDotIndex);
    } catch (error) {
      return null;
    }
  }

  async deleteImagesByUrls(urls: string[]): Promise<void> {
    if (!urls || urls.length === 0) return;

    const deletePromises = urls.map(async (url) => {
      const publicId = this.extractPublicId(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          this.logger.log(`Deleted image from Cloudinary: ${publicId}`);
        } catch (error) {
          this.logger.error(`Failed to delete image: ${publicId}`, error);
        }
      }
    });

    await Promise.allSettled(deletePromises);
  }
}
