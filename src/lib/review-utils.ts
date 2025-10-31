interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
}

export async function getReviewStats(companyId: string | number): Promise<ReviewStats> {
  try {
    const response = await fetch(`/api/reviews?companyId=${companyId}&limit=1000`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch review stats');
    }

    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      return { totalReviews: 0, averageRating: null };
    }

    const reviews = data.data;
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return { totalReviews: 0, averageRating: null };
    }

    const totalRating = reviews.reduce((sum: number, review: any) => {
      return sum + (review.rating || 0);
    }, 0);
    
    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal place

    return {
      totalReviews,
      averageRating
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { totalReviews: 0, averageRating: null };
  }
}
