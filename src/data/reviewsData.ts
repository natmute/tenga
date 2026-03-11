import type { Review } from '@/types';

export const reviews: Review[] = [];

export const getReviewsByProductId = (_productId: string): Review[] => [];

export const getAverageRating = (productId: string): number => {
  const productReviews = getReviewsByProductId(productId);
  if (productReviews.length === 0) return 0;
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / productReviews.length) * 10) / 10;
};

export const getRatingBreakdown = (productId: string): Record<number, number> => {
  const productReviews = getReviewsByProductId(productId);
  return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
};
