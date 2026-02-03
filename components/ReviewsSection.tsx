
import React, { useState, useMemo } from 'react';
import { Product, Review, User } from '../types';
import StarRating from './pages/StarRating';
import { Star, User as UserIcon } from 'lucide-react';

interface ReviewsSectionProps {
  product: Product;
  currentUser: User | null;
  onLoginClick: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ product, currentUser, onLoginClick }) => {
  const [reviews, setReviews] = useState<Review[]>(product.reviews || []);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating > 0 && newComment.trim() !== '' && currentUser) {
      const newReview: Review = {
        id: `r${Date.now()}`,
        user: currentUser.name,
        rating: newRating,
        comment: newComment,
        date: new Date().toISOString().split('T')[0],
      };
      setReviews([newReview, ...reviews]);
      setNewRating(0);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-dozo-charcoal mb-6">Reviews & Ratings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Rating Summary */}
        <div className="lg:col-span-2">
            {reviews.length > 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border flex flex-col items-center justify-center text-center">
                  <p className="text-5xl font-extrabold text-dozo-charcoal">{averageRating.toFixed(1)}</p>
                  <div className="my-2">
                     <StarRating rating={averageRating} />
                  </div>
                  <p className="text-sm text-dozo-gray">Based on {reviews.length} reviews</p>
                </div>
              )}
              
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-dozo-charcoal">Leave a Review</h3>
              {currentUser ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <button
                            type="button"
                            key={ratingValue}
                            onClick={() => setNewRating(ratingValue)}
                            onMouseEnter={() => setHoverRating(ratingValue)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            <Star
                              className={`w-7 h-7 cursor-pointer transition-colors ${
                                ratingValue <= (hoverRating || newRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal sm:text-sm"
                      placeholder="Share your experience..."
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-dozo-teal text-white font-bold py-2 px-4 rounded-md hover:bg-dozo-charcoal-light transition-all disabled:bg-gray-400"
                    disabled={newRating === 0 || newComment.trim() === ''}
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
                  <p className="text-dozo-gray text-sm mb-3">You must be logged in to leave a review.</p>
                  <button
                    onClick={onLoginClick}
                    className="bg-dozo-teal text-white font-semibold py-2 px-4 rounded-md hover:bg-dozo-charcoal-light transition-all text-sm"
                  >
                    Log In or Sign Up
                  </button>
                </div>
              )}
            </div>
        </div>

        {/* Existing Reviews */}
        <div className="lg:col-span-3 space-y-6 max-h-96 lg:max-h-[500px] overflow-y-auto pr-4 -mr-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start">
                   <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                       <UserIcon className="w-5 h-5 text-gray-500" />
                   </div>
                   <div className="flex-grow">
                        <div className="flex justify-between items-center">
                             <p className="font-semibold text-dozo-charcoal text-sm">{review.user}</p>
                             <StarRating rating={review.rating} />
                        </div>
                       <p className="text-xs text-gray-500 mb-2">{new Date(review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       <p className="text-dozo-gray text-sm">{review.comment}</p>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 italic h-full flex items-center justify-center">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;