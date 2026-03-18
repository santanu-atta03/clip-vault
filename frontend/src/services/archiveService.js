import api from './api';

const archiveService = {
    getArchives: async (folderId) => {
        const query = folderId && folderId !== 'null' ? `?folderId=${folderId}` : '';
        const response = await api.get(`/archives${query}`);
        return response.data;
    },

    createFolder: async (name, parentFolder, color) => {
        const response = await api.post('/archives/folders', {
            name,
            parentFolder,
            color
        });
        return response.data;
    },

    deleteFolder: async (id) => {
        const response = await api.delete(`/archives/folders/${id}`);
        return response.data;
    },

    uploadDocument: async (formData) => {
        const response = await api.post('/archives/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteDocument: async (id) => {
        const response = await api.delete(`/archives/documents/${id}`);
        return response.data;
    }
};

export default archiveService;
