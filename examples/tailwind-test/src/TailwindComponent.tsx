
export default function TailwindTest() {
    return (
        <div className="p-10 bg-slate-900 min-h-screen text-slate-100">
            <div className="max-w-md mx-auto bg-slate-800 rounded-3xl shadow-2xl overflow-hidden md:max-w-4xl border border-slate-700">
                <div className="md:flex">
                    <div className="md:shrink-0">
                        <div className="h-48 w-full md:h-full md:w-64 bg-teal-500 flex items-center justify-center text-slate-900 text-4xl font-extrabold italic">
                            URJA
                        </div>
                    </div>
                    <div className="p-10">
                        <div className="uppercase tracking-widest text-xs text-teal-400 font-bold mb-2">Build Verification</div>
                        <h1 className="block mt-1 text-3xl leading-tight font-black text-white">🌊 Urja Build Tool - Tailwind CSS Test</h1>
                        <p className="mt-4 text-slate-400 text-lg">Framework: <strong>Tailwind CSS 3.x (PostCSS Engine)</strong></p>
                        <div className="mt-6 flex items-center space-x-3 bg-teal-900/30 p-4 rounded-xl border border-teal-500/20">
                            <span className="flex h-3 w-3 rounded-full bg-teal-500"></span>
                            <p className="text-teal-400 font-medium text-sm">Status: ✅ Utility-first JIT Engine Verified</p>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button className="px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-full hover:bg-teal-400 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/50">
                                Verify Styles
                            </button>
                            <button className="px-6 py-3 bg-slate-700 text-white font-bold rounded-full hover:bg-slate-600 transition-all border border-slate-600">
                                View Config
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
