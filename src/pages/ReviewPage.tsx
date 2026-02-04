import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import { products, getShopById } from '@/data/mockData';
import { getReviewsByProductId, getAverageRating, getRatingBreakdown } from '@/data/reviewsData';
import { cn } from '@/lib/utils';

const ReviewPage = () => {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const shop = product ? getShopById(product.shopId) : null;

  if (!product || !shop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const reviews = getReviewsByProductId(product.id);
  const averageRating = getAverageRating(product.id);
  const ratingBreakdown = getRatingBreakdown(product.id);
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      {/* Back Button */}
      <div className="container py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/product/${product.slug}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Product
          </Link>
        </Button>
      </div>

      <div className="container pb-12">
        {/* Product Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-8"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-20 w-20 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-xl font-bold">{product.name}</h1>
            <Link to={`/shop/${shop.slug}`} className="text-sm text-muted-foreground hover:text-primary">
              {shop.name}
            </Link>
          </div>
        </motion.div>

        {/* Rating Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-8 md:grid-cols-2 mb-8 p-6 rounded-2xl bg-secondary"
        >
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="text-5xl font-bold">{averageRating}</span>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= Math.round(averageRating)
                          ? "fill-warning text-warning"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {totalReviews} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingBreakdown[rating];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Reviews List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">All Reviews ({totalReviews})</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-secondary rounded-2xl">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {review.userName === 'Anonymous' || !review.userAvatar ? (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {review.userName === 'Anonymous' ? 'Anonymous User' : review.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= review.rating
                                ? "fill-warning text-warning"
                                : "fill-muted text-muted"
                            )}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-muted-foreground text-sm">{review.comment}</p>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review image ${idx + 1}`}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
