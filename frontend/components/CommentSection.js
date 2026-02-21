import { useState, useEffect } from 'react';

export default function CommentSection({ contentType, contentSlug, pageTitle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [notifyOnReply, setNotifyOnReply] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const storageKey = `comments_${contentType}_${contentSlug}`;

  useEffect(() => {
    const savedComments = localStorage.getItem(storageKey);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        console.error('Error loading comments:', e);
      }
    }
  }, [storageKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newComment.trim()) {
      setError('Please enter your comment');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      const comment = {
        id: Date.now(),
        username: username.trim(),
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        notifyOnReply,
        contentType,
        contentSlug
      };

      const updatedComments = [comment, ...comments];
      setComments(updatedComments);
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));

      setNewComment('');
      setAgreeToTerms(false);
      setSuccess('Your comment has been posted successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-12 border-t border-neutral-200 pt-8" data-testid="comment-section">
      <button 
        className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors mb-8"
        data-testid="button-cite-article"
      >
        Cite this Article
      </button>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4" data-testid="text-post-comment-heading">
          Post a Comment
        </h2>
        
        <p className="text-neutral-600 mb-6">
          Comments should be on the topic and should not be abusive. The editorial team 
          reserves the right to review and moderate the comments posted on the site.
        </p>

        <form onSubmit={handleSubmit} data-testid="form-comment">
          <div className="mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Name"
              className="w-full border border-neutral-300 rounded px-4 py-3 text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              data-testid="input-comment-username"
            />
          </div>

          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post your comments"
              rows={5}
              className="w-full border border-neutral-300 rounded px-4 py-3 text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              data-testid="textarea-comment-content"
            />
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-3 cursor-pointer" data-testid="label-notify-checkbox">
              <input
                type="checkbox"
                checked={notifyOnReply}
                onChange={(e) => setNotifyOnReply(e.target.checked)}
                className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                data-testid="checkbox-notify-reply"
              />
              <span className="text-neutral-700">Notify me when reply is posted</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer" data-testid="label-terms-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                data-testid="checkbox-agree-terms"
              />
              <span className="text-neutral-700">I agree to the terms and conditions</span>
            </label>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded" data-testid="text-comment-error">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded" data-testid="text-comment-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-6 py-2.5 rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-post-comment"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>

      <div data-testid="comments-list">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6" data-testid="text-comments-heading">
          Comments
        </h2>

        {comments.length === 0 ? (
          <p className="text-neutral-500 italic" data-testid="text-no-comments">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="border-l-4 border-primary pl-4 py-2"
                data-testid={`comment-item-${comment.id}`}
              >
                <div className="mb-2">
                  <span className="font-bold text-neutral-900" data-testid={`text-comment-username-${comment.id}`}>
                    {comment.username}
                  </span>
                  <span className="text-neutral-400 text-sm ml-3">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-neutral-700 leading-relaxed" data-testid={`text-comment-content-${comment.id}`}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
