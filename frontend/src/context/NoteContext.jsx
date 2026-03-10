import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notes');
            setNotes(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    }, []);

    const createNote = async (formData) => {
        try {
            const { data } = await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNotes(prev => [data, ...prev]);
            toast.success('Note created');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create note');
            throw error;
        }
    };

    const updateNote = async (id, formData) => {
        try {
            const { data } = await api.put(`/notes/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNotes(prev => prev.map(note => note._id === id ? data : note));
            toast.success('Note updated');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update note');
            throw error;
        }
    };

    const deleteNote = async (id) => {
        try {
            await api.delete(`/notes/${id}`);
            setNotes(prev => prev.filter(note => note._id !== id));
            toast.success('Note deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete note');
            throw error;
        }
    };

    return (
        <NoteContext.Provider value={{
            notes,
            loading,
            fetchNotes,
            createNote,
            updateNote,
            deleteNote
        }}>
            {children}
        </NoteContext.Provider>
    );
};
