// app/Services/CloudinaryService.ts
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'


// Typage du retour d'upload
type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
  resource_type: string
  [key: string]: any
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

export default class CloudinaryService {
  static async upload(filePath: string): Promise<CloudinaryUploadResult> {
    const result: CloudinaryUploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    })

    // Nettoyage du fichier temporaire
    await fs.unlink(filePath)

    return result
  }

  static async uploadVideo(filePath: string, folder: string = 'adonis_uploads') {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        { folder, resource_type: 'video' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    })
  }
}
