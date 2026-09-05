import { useState } from "react";
import api, { getErrorMessage, getImageUrl } from "../services/api";
import CommentSection from "./CommentSection";

const formatDate = (date) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));

function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("socially_user") || "null");
  const userId = user?.id || user?._id;
  const liked = likes.some((like) => String(like.userId) === String(userId));

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setError("");
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      setLikes(response.data.likes);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update like."));
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="post-card surface">
      <div className="post-header">
        <div className="avatar">{post.username?.charAt(0).toUpperCase()}</div>
        <div><strong>{post.username}</strong><p>{formatDate(post.createdAt)}</p></div>
      </div>
      {post.text && <p className="post-text">{post.text}</p>}
      {post.image && <img className="post-image" src={getImageUrl(post.image)} alt={`Post by ${post.username}`} />}
      <div className="post-stats"><span>{likes.length} {likes.length === 1 ? "like" : "likes"}</span><span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span></div>
      <div className="post-actions">
        <button className={liked ? "action-button liked" : "action-button"} type="button" onClick={handleLike} disabled={isLiking}>
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {liked ? "Liked" : "Like"}
        </button>
        <span className="action-button comment-label"><span aria-hidden="true">◌</span> Comment</span>
      </div>
      <CommentSection postId={post._id} comments={comments} onCommented={setComments} />
      {error && <p className="form-error">{error}</p>}
    </article>
  );
}

export default PostCard;
