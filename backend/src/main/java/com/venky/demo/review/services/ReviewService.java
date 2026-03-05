package com.venky.demo.review.services;

import com.venky.demo.response.Response;
import com.venky.demo.review.dtos.ReviewDTO;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface ReviewService {
    Response<ReviewDTO> createReview(ReviewDTO reviewDTO) throws BadRequestException;
    Response<List<ReviewDTO>> getReviewsForMenu(Long menuId);
    Response<Double> getAverageRating(Long menuId);
}
