// src/cloudinary/cloudinary.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import apiGatewayConfig from '../../../config/api-gateway.config';

cloudinary.config({
  cloud_name: apiGatewayConfig().cloudinary.cloudName,
  api_key: apiGatewayConfig().cloudinary.apiKey,
  api_secret: apiGatewayConfig().cloudinary.apiSecret,
  secure: true,
});

@Injectable()
export class ImageService {
  async uploadBase64File(
    base64File: string,
    folder = 'uploads',
    public_id: string,
  ) {
    try {
      const response = await cloudinary.uploader.upload(base64File, {
        public_id,
        folder,
        resource_type: 'auto',
      });
      return response;
    } catch (err: any) {
      Logger.error(err, 'Cloudinary Error');
      throw new Error(err.message);
    }
  }

  async deleteFile(publicId: string) {
    try {
      const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
      return response;
    } catch (err: any) {
      Logger.error(err, 'Cloudinary Error');
      throw new Error(err.message);
    }
  }
}
