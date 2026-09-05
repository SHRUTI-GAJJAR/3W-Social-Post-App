import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import api, { getErrorMessage } from "../services/api";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, hasMore: false });

  const loadPosts = async (page = 1, append = false) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=10`);
      const nextPosts = response.data.posts || [];
      const nextPagination = response.data.pagination || { currentPage: page, hasMore: false };

      setPosts((currentPosts) => {
        if (!append) return nextPosts;

        const existingIds = new Set(currentPosts.map((post) => post._id));
        return [...currentPosts, ...nextPosts.filter((post) => !existingIds.has(post._id))];
      });
      setPagination(nextPagination);
      setStatus("ready");
      setLoadMoreError("");
    } catch (requestError) {
      const message = getErrorMessage(requestError, "We couldn't load the feed right now.");
      if (append) {
        setLoadMoreError(message);
      } else {
        setError(message);
        setStatus("error");
      }
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleRetry = () => {
    setStatus("loading");
    loadPosts();
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasMore) return;

    setIsLoadingMore(true);
    await loadPosts(pagination.currentPage + 1, true);
    setIsLoadingMore(false);
  };

  const handleCreated = (post) => {
    setPosts((currentPosts) => [post, ...currentPosts]);
    setPagination((currentPagination) => {
      const totalPosts = (currentPagination.totalPosts || 0) + 1;
      const totalPages = Math.ceil(totalPosts / 10);

      return {
        ...currentPagination,
        totalPosts,
        totalPages,
        hasMore: currentPagination.currentPage < totalPages,
      };
    });
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="feed-layout">
        <div className="feed-intro"><p className="eyebrow">Your little corner of the internet</p><h1>Good things, shared.</h1></div>
        <CreatePost onCreated={handleCreated} />
        <section className="posts-section" aria-live="polite">
          {status === "loading" && <div className="empty-state">Loading posts...</div>}
          {status === "error" && <div className="empty-state"><p>{error}</p><button className="secondary-button" type="button" onClick={handleRetry}>Try again</button></div>}
          {status === "ready" && posts.length === 0 && <div className="empty-state">No posts yet. Be the first to share something! ✨</div>}
          {status === "ready" && posts.map((post) => <PostCard key={post._id} post={post} />)}
          {status === "ready" && posts.length > 0 && pagination.hasMore && (
            <div className="load-more-wrap">
              <button className="secondary-button load-more-button" type="button" onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "Loading..." : "Load More"}
              </button>
              {loadMoreError && <p className="form-error">{loadMoreError}</p>}
            </div>
          )}
          {status === "ready" && posts.length > 0 && !pagination.hasMore && <p className="end-message">You've reached the end.</p>}
        </section>
      </main>
    </div>
  );
}

export default Feed;
