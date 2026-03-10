import api from './api';

const serverService = {
    getServers: async (search = '') => {
        const response = await api.get(`/servers?search=${search}`);
        return response.data;
    },

    getServer: async (id) => {
        const response = await api.get(`/servers/${id}`);
        return response.data;
    },

    createServer: async (formData) => {
        const response = await api.post('/servers/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateServer: async (id, formData) => {
        const response = await api.put(`/servers/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteServer: async (id) => {
        const response = await api.delete(`/servers/${id}`);
        return response.data;
    },

    requestJoin: async (id) => {
        const response = await api.post(`/servers/${id}/request-join`);
        return response.data;
    },

    getServerRequests: async (id) => {
        const response = await api.get(`/servers/${id}/requests`);
        return response.data;
    },

    acceptRequest: async (requestId) => {
        const response = await api.post(`/servers/requests/${requestId}/accept`);
        return response.data;
    },

    rejectRequest: async (requestId) => {
        const response = await api.post(`/servers/requests/${requestId}/reject`);
        return response.data;
    },

    leaveServer: async (id) => {
        const response = await api.post(`/servers/${id}/leave`);
        return response.data;
    },

    getServerMembers: async (id) => {
        const response = await api.get(`/servers/${id}/members`);
        return response.data;
    },

    // Posts
    getServerPosts: async (id, page = 1) => {
        const response = await api.get(`/servers/${id}/posts?page=${page}`);
        return response.data;
    },

    createPost: async (serverId, formData) => {
        const response = await api.post(`/servers/${serverId}/posts`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deletePost: async (postId) => {
        const response = await api.delete(`/posts/${postId}`);
        return response.data;
    }
};

export default serverService;
