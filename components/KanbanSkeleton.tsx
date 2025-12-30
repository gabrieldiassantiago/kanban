export function KanbanSkeleton() {
    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 min-w-[320px] flex flex-col h-full rounded-2xl bg-white/50 backdrop-blur-sm px-2 animate-pulse">
                    <div className="flex items-center justify-between p-4 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
                            <div className="h-6 w-8 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="flex gap-1">
                            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                            <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-3">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="bg-white rounded-xl p-4 border border-transparent shadow-sm">
                                <div className="flex justify-between mb-3">
                                    <div className="h-5 w-16 bg-slate-100 rounded-md"></div>
                                    <div className="h-4 w-4 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="h-5 w-3/4 bg-slate-200 rounded-md mb-2"></div>
                                <div className="h-4 w-full bg-slate-100 rounded-md mb-1"></div>
                                <div className="h-4 w-1/2 bg-slate-100 rounded-md mb-4"></div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                    </div>
                                    <div className="h-4 w-16 bg-slate-100 rounded-md"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
