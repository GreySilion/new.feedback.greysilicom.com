interface Review {
  rating?: number;
  // Add other review properties as needed
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
}

export async function getReviewStats(companyId: string | number): Promise<ReviewStats> {
  try {
    // First, get the total count of reviews
    const countResponse = await fetch(`/api/reviews?companyId=${companyId}&limit=1`);
    
    if (!countResponse.ok) {
      throw new Error('Failed to fetch review stats');
    }

    const countData = await countResponse.json();
    
    if (!countData.success) {
      return { totalReviews: 0, averageRating: null };
    }

    const totalReviews = countData.pagination?.total || 0;
    
    if (totalReviews === 0) {
      return { totalReviews: 0, averageRating: null };
    }

    // Get a sample of reviews to calculate average rating
    const reviewsResponse = await fetch(`/api/reviews?companyId=${companyId}&limit=100`);
    
    if (!reviewsResponse.ok) {
      // If we can't get reviews, just return the count with null rating
      return { totalReviews, averageRating: null };
    }

    const reviewsData = await reviewsResponse.json();
    
    if (!reviewsData.success || !Array.isArray(reviewsData.data) || reviewsData.data.length === 0) {
      return { totalReviews, averageRating: null };
    }

    const reviews = reviewsData.data;
    const totalRating = reviews.reduce((sum: number, review: Review) => {
      return sum + (review.rating || 0);
    }, 0);
    
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place

    return {
      totalReviews,
      averageRating
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { totalReviews: 0, averageRating: null };
  }
}
