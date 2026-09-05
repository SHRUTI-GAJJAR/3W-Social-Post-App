import { useRef, useState } from "react";
import api, { getErrorMessage } from "../services/api";

function CreatePost({ onCreated }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim() && !image) {
      setError("Add some text or an image before posting.");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);

    setIsPosting(true);
    setError("");
    try {
      const response = await api.post("/posts", formData);
      onCreated(response.data.post);
      setText("");
      setImage(null);
      setPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to publish your post."));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <section className="composer surface">
      <div className="composer-heading">
        <div className="avatar avatar-accent">S</div>
        <div>
          <p className="eyebrow">Create something</p>
          <h1>What's on your mind?</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Share something with everyone..."
          rows="4"
          maxLength="1000"
        />
        {preview && <img className="image-preview" src={preview} alt="Selected preview" />}
        <div className="composer-footer">
          <label className="upload-button">
            <span aria-hidden="true">+</span> Add image
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          </label>
          <button className="primary-button" type="submit" disabled={isPosting}>
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}

export default CreatePost;
