const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  static async uploadMedia(file) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.tmpPath,
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result); // Contient l'URL de l'image/vidéo
          }
        }
      );
    });
  }
}

module.exports = CloudinaryService;