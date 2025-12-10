import axios, { isAxiosError } from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API;

const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET;

export const uploadImage = async (imageUri: string) => {
    if (!API_SECRET || !API_BASE) {
        throw new Error('API configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    const fileObject = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile-${Date.now()}.jpg`,
    } as any;

    formData.append('file', fileObject);

    try {
        const response = await axios.post(`${API_BASE}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${API_SECRET}`,
            },
        });

        return response.data.url;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Upload failed: ${error.response?.status} - ${error.response?.data || error.message}`);
        }
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default {
    uploadImage
};