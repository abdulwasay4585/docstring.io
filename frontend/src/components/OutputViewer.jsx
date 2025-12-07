import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';

const OutputViewer = ({ docstring, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(docstring);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-xl relative group">
            <div className="absolute top-2 right-2 z-10">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-600 transition-all shadow-lg hover:text-white"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-medium text-green-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            <span className="text-xs font-medium">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Overlay for empty state */}
            {!docstring && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900/50 backdrop-blur-sm z-20">
                    <p className="text-sm">Generated docstring will appear here...</p>
                </div>
            )}

            <Editor
                height="100%"
                defaultLanguage="markdown"
                language={language} // Use same language for now or markdown? Docstring is usually code comments.
                value={docstring}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: true,
                    lineNumbers: 'off',
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'Fira Code', monospace",
                }}
            />
        </div>
    );
};

export default OutputViewer;
