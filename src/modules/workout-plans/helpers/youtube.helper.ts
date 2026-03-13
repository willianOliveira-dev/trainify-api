interface YoutubeSearchResult {
    videoId: string;
    thumbnailUrl: string;
}
interface YoutubeApiResponse {
    items?: {
        id: { videoId: string };
        snippet: {
            title: string;
            thumbnails: {
                high: { url: string };
            };
        };
    }[];
}

async function searchYoutubeVideo(
    query: string,
): Promise<YoutubeSearchResult | null> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        return null;
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', `${query} como fazer execução`);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '5');
    url.searchParams.set('relevanceLanguage', 'pt');
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
        return null;
    }

    const data = await response.json() as YoutubeApiResponse;
    const item = data.items?.[0];

    if (!item) {
        return null;
    }

    return {
        videoId: item.id.videoId,
        thumbnailUrl: item.snippet.thumbnails.high.url,
    };
}

export { searchYoutubeVideo, type YoutubeSearchResult };

