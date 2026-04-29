import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface GalleryImage {
    id: string;
    imageUrl: string;
    title: string | null;
    order: number;
}

interface GalleryCarouselProps {
    images: GalleryImage[];
    primaryColor?: string;
}

export default function GalleryCarousel({ images, primaryColor = "#000000" }: GalleryCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);

    const total = images.length;

    const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
    const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

    // Auto-advance every 5 seconds
    useEffect(() => {
        if (lightbox !== null || isDragging) return;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next, lightbox, isDragging]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (lightbox === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightbox(null);
            if (e.key === "ArrowLeft") setLightbox((l) => ((l ?? 0) - 1 + total) % total);
            if (e.key === "ArrowRight") setLightbox((l) => ((l ?? 0) + 1) % total);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lightbox, total]);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (lightbox !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [lightbox]);

    // Early return AFTER all hooks (Rules of Hooks: hooks must not be conditional)
    if (total === 0) return null;

    // Touch handlers for smooth mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
        setIsDragging(true);
        setDragOffset(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const currentX = e.touches[0].clientX;
        const containerWidth = trackRef.current?.parentElement?.offsetWidth || 1;
        const diff = touchStart - currentX;
        // Convert pixel difference to percentage for smooth visual feedback
        setDragOffset((diff / containerWidth) * 100);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
        }
        setTouchStart(null);
        setIsDragging(false);
        setDragOffset(0);
    };



    const translateX = -(current * 100) - dragOffset;

    return (
        <>
            {/* Carousel Container */}
            <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[32px] bg-gray-100 shadow-xl">

                {/* Image Counter Badge (Mobile) */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                    {current + 1} / {total}
                </div>

                {/* Track */}
                <div
                    ref={trackRef}
                    className="flex"
                    style={{
                        transform: `translateX(${translateX}%)`,
                        transition: isDragging ? "none" : "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {images.map((img, idx) => (
                        <div
                            key={img.id}
                            className="w-full flex-shrink-0 relative group cursor-pointer"
                        >
                            {/* Responsive aspect ratio: taller on mobile for better visibility */}
                            <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9]">
                                <img
                                    src={img.imageUrl}
                                    alt={img.title || "Galería"}
                                    className="w-full h-full object-cover"
                                    loading={idx < 2 ? "eager" : "lazy"}
                                    draggable={false}
                                />
                            </div>

                            {/* Hover overlay (desktop only) */}
                            <div
                                className="absolute inset-0 bg-black/0 md:group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center"
                                onClick={() => setLightbox(idx)}
                            >
                                <ZoomIn size={40} className="text-white opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                            </div>

                            {/* Title overlay */}
                            {img.title && (
                                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 sm:px-6 sm:py-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                                    <p className="text-white text-sm sm:text-lg font-bold italic drop-shadow-md line-clamp-2">{img.title}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows (hidden on mobile, visible on tablet+) */}
                {total > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/80 sm:bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-90 z-10 hidden sm:flex"
                        >
                            <ChevronLeft size={20} className="text-gray-800 sm:w-6 sm:h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/80 sm:bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-90 z-10 hidden sm:flex"
                        >
                            <ChevronRight size={20} className="text-gray-800 sm:w-6 sm:h-6" />
                        </button>
                    </>
                )}

                {/* Dots (progress indicator) */}
                {total > 1 && (
                    <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-black/30 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: i === current ? 20 : 8,
                                    height: 8,
                                    backgroundColor: i === current ? primaryColor : "rgba(255,255,255,0.4)",
                                    borderRadius: 999,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Mobile tap zones (invisible, for easy navigation) */}
                {total > 1 && (
                    <div className="absolute inset-0 flex sm:hidden z-[5]">
                        <div className="w-1/4 h-full" onClick={() => prev()} />
                        <div className="w-2/4 h-full" onClick={() => setLightbox(current)} />
                        <div className="w-1/4 h-full" onClick={() => next()} />
                    </div>
                )}
            </div>

            {/* Lightbox (Fullscreen Image Viewer) */}
            {lightbox !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                    onClick={() => setLightbox(null)}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/60 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-sm transition-colors z-20"
                        onClick={() => setLightbox(null)}
                    >
                        <X size={24} className="sm:w-9 sm:h-9" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white/50 text-xs sm:text-sm font-bold z-20">
                        {lightbox + 1} / {total}
                    </div>

                    {/* Desktop arrows */}
                    {total > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightbox((l) => ((l ?? 0) - 1 + total) % total); }}
                                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-20"
                            >
                                <ChevronLeft className="text-white w-5 h-5 sm:w-7 sm:h-7" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightbox((l) => ((l ?? 0) + 1) % total); }}
                                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-20"
                            >
                                <ChevronRight className="text-white w-5 h-5 sm:w-7 sm:h-7" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div
                        className="w-full h-full flex flex-col items-center justify-center px-2 sm:px-16 py-16 sm:py-12"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={(e) => {
                            if (touchStart === null) return;
                            const diff = touchStart - e.changedTouches[0].clientX;
                            if (Math.abs(diff) > 50) {
                                diff > 0
                                    ? setLightbox((l) => ((l ?? 0) + 1) % total)
                                    : setLightbox((l) => ((l ?? 0) - 1 + total) % total);
                            }
                            setTouchStart(null);
                            setIsDragging(false);
                            setDragOffset(0);
                        }}
                    >
                        <img
                            src={images[lightbox].imageUrl}
                            alt={images[lightbox].title || "Galería"}
                            className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-lg sm:rounded-2xl select-none"
                            draggable={false}
                        />
                        {images[lightbox].title && (
                            <p className="text-white text-base sm:text-xl font-bold italic mt-3 sm:mt-5 text-center px-4 drop-shadow-md">{images[lightbox].title}</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
