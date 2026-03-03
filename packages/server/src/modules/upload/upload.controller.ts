import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError, sendSuccess } from '../../common/utils/response.formatter';
import { cloudinaryService } from './cloudinary.service';

export class UploadController 
{
    async uploadFile(req: FastifyRequest, reply: FastifyReply) 
    {
        try 
        {
            const data = await req.file();

            if (!data) 
            {
                return sendError(reply, 'No file uploaded', 400);
            }

            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

            if (!ALLOWED_TYPES.includes(data.mimetype)) 
            {
                data.file.resume();
                return sendError(reply, 'Invalid file type. Only JPEG, PNG, and WebP are allowed', 400);
            }

            const folderField = data.fields.folder as any;
            const folderName = folderField?.value || 'profile';

            const fileUrl = await cloudinaryService.uploadFromStream(data.file, folderName);

            return sendSuccess(reply, { url: fileUrl }, 'File uploaded successfully', 201);
        } 
        catch (error) 
        {
            req.log.error(error);
            return sendError(reply, 'Internal Server Error');
        }
    }
}

export const uploadController = new UploadController();