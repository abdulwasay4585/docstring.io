import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange }) => {
    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-xl">
            <Editor
                height="100%"
                defaultLanguage="python"
                language={language}
                value={value}
                onChange={onChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'Fira Code', monospace",
                }}
            />
        </div>
    );
};

export default CodeEditor;
