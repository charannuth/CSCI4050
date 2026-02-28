export default function TrailerEmbed({ url, title }) {
  // 1. Failsafe for missing URL from the database
  if (!url) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center text-cinema-muted border border-gray-700 rounded-lg shadow-lg">
        Trailer not available
      </div>
    );
  }

  // 2. The Regex function to automatically force standard YouTube links into Embed links
  const getEmbedUrl = (rawUrl) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return rawUrl;
  };

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-700 bg-black">
      <iframe 
        src={getEmbedUrl(url)} 
        title={`${title || "Movie"} Trailer`}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      ></iframe>
    </div>
  );
}