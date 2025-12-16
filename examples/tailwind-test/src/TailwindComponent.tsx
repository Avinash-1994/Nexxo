
export default function TailwindTest() {
    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="md:flex">
                    <div className="md:shrink-0">
                        <div className="h-48 w-full object-cover md:h-full md:w-48 bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                            Img
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Tailwind CSS Test</div>
                        <a href="#" className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">Checking if classes work</a>
                        <p className="mt-2 text-slate-500">Since we are using 100% verified build pipeline.</p>
                        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            It works!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
