import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Loader2, Plus } from 'lucide-react';
import serverService from '../services/serverService';

const CreateServer = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIcon(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (icon) {
            formData.append('icon', icon);
        }

        try {
            const server = await serverService.createServer(formData);
            navigate(`/servers/${server._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-gray-950 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-3 duration-700">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-gray-600 hover:text-white mb-12 transition-all group px-4"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Workspace</span>
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-8 sm:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10" />

                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4">Initialize Cluster</h1>
                        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest max-w-sm mx-auto leading-relaxed">System Deployment Interface • Secure Channel Establishment</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="flex flex-col items-center">
                            <label className="relative group cursor-pointer">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gray-950 border-2 border-dashed border-gray-800 flex items-center justify-center overflow-hidden group-hover:border-indigo-500 transition-all shadow-2xl">
                                    {preview ? (
                                        <img src={preview} alt="Icon preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Camera size={32} className="text-gray-700 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleIconChange}
                                />
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-2xl p-2.5 shadow-2xl shadow-indigo-600/40 border border-indigo-500 group-hover:scale-110 active:scale-95 transition-all">
                                    <Plus size={16} className="text-white" />
                                </div>
                            </label>
                            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-6">Upload Visual Identity</span>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 px-4">Cluster Designation</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="DESIGNATION-X"
                                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-800 font-black text-lg md:text-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 px-4">Strategic Objective</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4"
                                    placeholder="Define the scope of collaboration..."
                                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-800 resize-none font-medium leading-relaxed"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    <span>Initiate Protocol</span>
                                    <Plus size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default CreateServer;
