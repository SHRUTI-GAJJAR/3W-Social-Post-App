import { useState } from "react";
import api, { getErrorMessage } from "../services/api";

function CommentSection({ postId, comments = [], onCommented }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      onCommented(response.data.comments);
      setText("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to add your comment."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comments">
      {comments.length > 0 && (
        <div className="comment-list">
          {comments.map((comment) => (
            <div className="comment" key={comment._id || `${comment.username}-${comment.createdAt}`}>
              <div className="avatar avatar-small">{comment.username?.charAt(0).toUpperCase()}</div>
              <div><strong>{comment.username}</strong><p>{comment.text}</p></div>
            </div>
          ))}
        </div>
      )}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a comment..." maxLength="500" />
        <button type="submit" aria-label="Submit comment" disabled={isSubmitting || !text.trim()}>↑</button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default CommentSection;
