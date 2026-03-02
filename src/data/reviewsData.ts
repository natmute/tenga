import { Review } from '@/types';

// Generate fake reviews for each product
export const reviews: Review[] = [
  // Product 1 - Oversized Cotton Hoodie
  {
    id: 'r1',
    productId: '1',
    userId: 'u1',
    userName: 'Rutendo Moyo',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Absolutely love this hoodie! The cotton is so soft and the oversized fit is perfect. Worth every penny.',
    createdAt: '2024-01-20',
  },
  {
    id: 'r2',
    productId: '1',
    userId: 'u2',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Great quality and comfortable. Runs a bit large but I like the relaxed fit.',
    createdAt: '2024-01-18',
  },
  {
    id: 'r3',
    productId: '1',
    userId: 'u3',
    userName: 'Takudzwa Chigumba',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Best hoodie I own. The material is premium and keeps me warm without being too heavy.',
    createdAt: '2024-01-15',
  },

  // Product 2 - Minimal White Sneakers
  {
    id: 'r4',
    productId: '2',
    userId: 'u4',
    userName: 'Tsitsi Nyathi',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'These sneakers go with everything! Super comfortable right out of the box.',
    createdAt: '2024-01-22',
  },
  {
    id: 'r5',
    productId: '2',
    userId: 'u5',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 5,
    comment: 'Clean design and excellent craftsmanship. Been wearing them daily for weeks.',
    createdAt: '2024-01-19',
  },
  {
    id: 'r6',
    productId: '2',
    userId: 'u6',
    userName: 'Tinashe Mapfumo',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Great quality leather. Had to break them in a bit but now they fit perfectly.',
    createdAt: '2024-01-16',
  },

  // Product 3 - Wireless Earbuds Pro
  {
    id: 'r7',
    productId: '3',
    userId: 'u7',
    userName: 'Rumbidzai Ncube',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Amazing sound quality and the noise cancellation is top-notch. Battery life is incredible!',
    createdAt: '2024-01-25',
  },
  {
    id: 'r8',
    productId: '3',
    userId: 'u8',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Great earbuds, comfortable for long listening sessions. The app could be better though.',
    createdAt: '2024-01-21',
  },
  {
    id: 'r9',
    productId: '3',
    userId: 'u9',
    userName: 'Kudakwashe Banda',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Perfect for workouts and commuting. The case is compact and charges quickly.',
    createdAt: '2024-01-17',
  },

  // Product 4 - Smart Watch Ultra
  {
    id: 'r10',
    productId: '4',
    userId: 'u10',
    userName: 'Nyasha Chirwa',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'This watch has changed my fitness routine! The health tracking is incredibly accurate.',
    createdAt: '2024-01-24',
  },
  {
    id: 'r11',
    productId: '4',
    userId: 'u11',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Beautiful display and great features. Wish the battery lasted a bit longer.',
    createdAt: '2024-01-20',
  },
  {
    id: 'r12',
    productId: '4',
    userId: 'u12',
    userName: 'Tatenda Mhizha',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Solid smartwatch with tons of features. The GPS is very accurate for running.',
    createdAt: '2024-01-18',
  },

  // Product 5 - Scandinavian Table Lamp
  {
    id: 'r13',
    productId: '5',
    userId: 'u13',
    userName: 'Chiedza Manyika',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'This lamp creates the perfect ambiance. Absolutely stunning piece for my living room!',
    createdAt: '2024-01-23',
  },
  {
    id: 'r14',
    productId: '5',
    userId: 'u14',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 5,
    comment: 'Simple, elegant, and exactly what I was looking for. Highly recommend!',
    createdAt: '2024-01-19',
  },
  {
    id: 'r15',
    productId: '5',
    userId: 'u15',
    userName: 'Farai Mutasa',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Beautiful craftsmanship and the warm light is perfect for reading.',
    createdAt: '2024-01-15',
  },

  // Product 6 - Ceramic Vase Set
  {
    id: 'r16',
    productId: '6',
    userId: 'u16',
    userName: 'Tendai Zvobgo',
    userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'These vases are even more beautiful in person. Each one is unique and well-made.',
    createdAt: '2024-01-21',
  },
  {
    id: 'r17',
    productId: '6',
    userId: 'u17',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Love the minimalist design. One vase was slightly different but still lovely.',
    createdAt: '2024-01-17',
  },
  {
    id: 'r18',
    productId: '6',
    userId: 'u18',
    userName: 'Simbarashe Dube',
    userAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Great set for the price. Perfect for dried flowers or as standalone decor.',
    createdAt: '2024-01-14',
  },

  // Product 7 - Hydrating Face Serum
  {
    id: 'r19',
    productId: '7',
    userId: 'u19',
    userName: 'Ruvimbo Chikwanha',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'My skin has never looked better! This serum is a game-changer for dry skin.',
    createdAt: '2024-01-26',
  },
  {
    id: 'r20',
    productId: '7',
    userId: 'u20',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Very hydrating and absorbs quickly. A little goes a long way.',
    createdAt: '2024-01-22',
  },
  {
    id: 'r21',
    productId: '7',
    userId: 'u21',
    userName: 'Kudzai Mariga',
    userAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'The vitamin C really brightened my complexion. Will definitely repurchase!',
    createdAt: '2024-01-19',
  },

  // Product 8 - Luxury Lipstick Set
  {
    id: 'r22',
    productId: '8',
    userId: 'u22',
    userName: 'Tariro Sibanda',
    userAvatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'The colors are gorgeous and they last all day. Such a great value for 5 lipsticks!',
    createdAt: '2024-01-24',
  },
  {
    id: 'r23',
    productId: '8',
    userId: 'u23',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Beautiful shades and creamy formula. One shade was slightly different from the photo.',
    createdAt: '2024-01-20',
  },
  {
    id: 'r24',
    productId: '8',
    userId: 'u24',
    userName: 'Yeukai Madziva',
    userAvatar: 'https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Love the matte finish! Very pigmented and comfortable to wear.',
    createdAt: '2024-01-16',
  },

  // Product 9 - Performance Yoga Mat
  {
    id: 'r25',
    productId: '9',
    userId: 'u25',
    userName: 'Nokuthula Phiri',
    userAvatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Best yoga mat I have ever owned. The grip is amazing and the cushioning is perfect.',
    createdAt: '2024-01-23',
  },
  {
    id: 'r26',
    productId: '9',
    userId: 'u26',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 5,
    comment: 'No more slipping during hot yoga! This mat holds up so well.',
    createdAt: '2024-01-19',
  },
  {
    id: 'r27',
    productId: '9',
    userId: 'u27',
    userName: 'Tawanda Makoni',
    userAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Great quality and eco-friendly. A bit heavy to carry but worth it.',
    createdAt: '2024-01-15',
  },

  // Product 10 - Training Resistance Bands
  {
    id: 'r28',
    productId: '10',
    userId: 'u28',
    userName: 'Blessing Chikowore',
    userAvatar: 'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Perfect for home workouts! The different resistance levels are great for progression.',
    createdAt: '2024-01-22',
  },
  {
    id: 'r29',
    productId: '10',
    userId: 'u29',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Good quality bands. The heaviest one is really challenging.',
    createdAt: '2024-01-18',
  },
  {
    id: 'r30',
    productId: '10',
    userId: 'u30',
    userName: 'Munashe Gumbo',
    userAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Great value for a set of 5. Using them for physical therapy and they work perfectly.',
    createdAt: '2024-01-14',
  },

  // Product 11 - Vintage Denim Jacket
  {
    id: 'r31',
    productId: '11',
    userId: 'u31',
    userName: 'Panashe Kunaka',
    userAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'Authentic vintage quality! The wash and wear patterns are perfect.',
    createdAt: '2024-01-25',
  },
  {
    id: 'r32',
    productId: '11',
    userId: 'u32',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 5,
    comment: 'Love the retro feel. Fits exactly as expected and looks amazing.',
    createdAt: '2024-01-21',
  },
  {
    id: 'r33',
    productId: '11',
    userId: 'u33',
    userName: 'Tapiwa Mugabe',
    userAvatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'A true vintage piece. The quality is unmatched compared to modern fast fashion.',
    createdAt: '2024-01-17',
  },

  // Product 12 - Retro Sunglasses
  {
    id: 'r34',
    productId: '12',
    userId: 'u34',
    userName: 'Ropafadzo Zvidzai',
    userAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop',
    rating: 5,
    comment: 'These sunglasses are so stylish! Get compliments every time I wear them.',
    createdAt: '2024-01-24',
  },
  {
    id: 'r35',
    productId: '12',
    userId: 'u35',
    userName: 'Anonymous',
    userAvatar: '',
    rating: 4,
    comment: 'Love the vintage look. Good UV protection and comfortable fit.',
    createdAt: '2024-01-20',
  },
  {
    id: 'r36',
    productId: '12',
    userId: 'u36',
    userName: 'Tanaka Hungwe',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4,
    comment: 'Classic cat-eye style looks great. The tortoise color is beautiful.',
    createdAt: '2024-01-16',
  },
];

export const getReviewsByProductId = (productId: string): Review[] => {
  return reviews.filter(r => r.productId === productId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getAverageRating = (productId: string): number => {
  const productReviews = getReviewsByProductId(productId);
  if (productReviews.length === 0) return 0;
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / productReviews.length) * 10) / 10;
};

export const getRatingBreakdown = (productId: string): Record<number, number> => {
  const productReviews = getReviewsByProductId(productId);
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach(r => {
    breakdown[r.rating]++;
  });
  return breakdown;
};
