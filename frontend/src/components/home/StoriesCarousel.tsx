import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStories, Story } from '../../api/stories';
import { StoryViewer } from '../StoryViewer';

export const StoriesCarousel = memo(() => {
    const navigate = useNavigate();
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    useEffect(() => {
        const loadStories = async () => {
            setIsLoading(true);
            const data = await getStories();
            setStories(data);
            setIsLoading(false);
        };

        loadStories();
    }, []);

    const handleStoryClick = (story: Story, index: number) => {
        // Если есть ссылка и нет медиа - переход по ссылке
        if (story.link && story.pages.length === 0) {
            navigate(story.link);
        } else {
            // Иначе открываем просмотрщик историй
            setCurrentStoryIndex(index);
            setIsViewerOpen(true);
        }
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
    };

    const handleStoryChange = (newIndex: number) => {
        setCurrentStoryIndex(newIndex);
    };

    // Показываем скелетон при загрузке
    if (isLoading) {
        return (
            <div className="w-full px-4 mb-8">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-30 h-45 shimmer rounded-2xl border border-white/10"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Если историй нет, не показываем секцию
    if (stories.length === 0) return null;

    return (
        <>
            <div className="w-full px-4 mb-8">
                {/* Horizontal scrollable stories */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {stories.map((story, index) => (
                        <div
                            key={story.id}
                            onClick={() => handleStoryClick(story, index)}
                            className="relative flex-shrink-0 w-30 h-45 rounded-2xl overflow-hidden cursor-pointer group will-change-transform hover:scale-105 active:scale-95 transition-transform"
                            style={{ transform: 'translate3d(0,0,0)' }}
                        >
                            {/* Preview Image */}
                            <img
                                src={story.previewImage}
                                alt={story.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 will-change-transform"
                                loading="lazy"
                                style={{ transform: 'translate3d(0,0,0)' }}
                            />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                            {/* Border - gradient ring effect */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#FF6B00] via-[#E94B3C] to-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ padding: '2px' }}>
                                <div className="w-full h-full rounded-2xl bg-[#0F0501]" />
                            </div>

                            {/* Gradient ring - always visible but subtle */}
                            <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-[#FF6B00]/30 via-[#E94B3C]/30 to-[#FF6B00]/30">
                                <div className="w-full h-full rounded-2xl" style={{ background: 'transparent' }} />
                            </div>

                            {/* Title - bottom left */}
                            <div className="absolute bottom-2 left-2 right-2 z-10">
                                <p className="text-xs font-bold text-white drop-shadow-lg line-clamp-2 leading-tight">
                                    {story.title}
                                </p>
                            </div>

                            {/* Media count indicator */}
                            {story.pages.length > 1 && (
                                <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full">
                                    <span className="text-[10px] font-bold text-white">
                                        {story.pages.length}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Story Viewer Modal */}
            <StoryViewer
                stories={stories}
                currentStoryIndex={currentStoryIndex}
                isOpen={isViewerOpen}
                onClose={handleCloseViewer}
                onStoryChange={handleStoryChange}
            />
        </>
    );
});
