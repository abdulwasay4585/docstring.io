import React from 'react';
import { History, Clock, FileCode, X } from 'lucide-react';

const Sidebar = ({ history, onLoadSnippet, onDeleteHistory }) => {
    return (
        <div className="w-64 bg-slate-950/70 backdrop-blur-md border-r border-slate-800/50 h-full flex flex-col">
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {history.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No recent history
                    </div>
                ) : (
                    history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onLoadSnippet(item)}
                            className="w-full text-left p-3 rounded-md hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-medium text-slate-300 uppercase">{item.language}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteHistory(item._id); }}
                                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete from history"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 truncate font-mono">
                                {item.code.substring(0, 30).replace(/\n/g, ' ')}...
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sidebar;
