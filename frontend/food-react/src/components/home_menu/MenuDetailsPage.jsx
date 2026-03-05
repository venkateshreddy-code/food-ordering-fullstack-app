import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../../services/ApiService";
import { useError } from "../common/ErrorDisplay";

const MenuDetailsPage = () => {
  // 1) Get the menu item id from the URL like /menu/5
  const { id } = useParams();

  // 2) Lets us move user to another page
  const navigate = useNavigate();

  // 3) State: store ONE menu item (not a list)
  const [menu, setMenu] = useState(null);

  // 4) State: store average rating number
  const [averageRating, setAverageRating] = useState(0);

  // 5) State: how many items user wants
  const [quantity, setQuantity] = useState(1);

  // 6) State: show “Added to cart” message
  const [cartSuccess, setCartSuccess] = useState(false);

  // 7) Check login using token in localStorage
  const isAuthenticated = ApiService.isAuthenticated();

  // 8) Error helper (shows red error bar)
  const { ErrorDisplay, showError } = useError();

  // 9) When page opens OR id changes, fetch menu details from backend
  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        // Ask backend: give menu item for this id
        const response = await ApiService.getMenuById(id);

        if (response.statusCode === 200) {
          setMenu(response.data);

          // Ask backend: give average rating for this menu
          const ratingResp = await ApiService.getMenuAverageOverallReview(id);

          if (ratingResp.statusCode === 200) {
            setAverageRating(ratingResp.data);
          } else {
            // If rating fails, just show error
            showError(ratingResp.message);
          }
        } else {
          showError(response.message);
        }
      } catch (error) {
        showError(error?.response?.data?.message || error.message);
      }
    };

    fetchMenuDetails();
  }, [id, showError]);

  // Go back one page
  const handleBackToMenu = () => {
    navigate(-1);
  };

  // Increase quantity
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Decrease quantity (but never below 1)
  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // Add item to cart
  const handleAddToCart = async () => {
    // If not logged in, show error and send to login
    if (!isAuthenticated) {
      showError("Please login to continue. If you don't have an account, register first.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Hide old success message
    setCartSuccess(false);

    try {
      const response = await ApiService.addItemToCart({
        menuId: Number(id),
        quantity: quantity,
      });

      if (response.statusCode === 200) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 3000);
      } else {
        showError(response.message);
      }
    } catch (error) {
      showError(error?.response?.data?.message || error.message);
    }
  };

  // If menu not loaded yet, show simple loading
  if (!menu) {
    return (
      <div className="menu-details-container">
        <ErrorDisplay />
        <p>Loading menu details...</p>
        <button onClick={handleBackToMenu} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  // Main UI when menu exists
  return (
    <div className="menu-details-container">
      <ErrorDisplay />

      <button onClick={handleBackToMenu} className="back-button">
        ← Back to Menu
      </button>

      <div className="menu-item-header">
        <div className="menu-item-image-container">
          <img
            src={menu.imageUrl}
            alt={menu.name}
            className="menu-item-image-detail"
          />
        </div>

        <div className="menu-item-info">
          <h1 className="menu-item-name">{menu.name}</h1>
          <p className="menu-item-description">{menu.description}</p>

          <div className="menu-item-price-rating">
            <span className="price">${Number(menu.price).toFixed(2)}</span>

            <div className="rating">
              <span className="rating-value">{Number(averageRating).toFixed(1)}</span>
              <span className="rating-star">★</span>
              <span className="rating-count">
                ({menu.reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <button
                onClick={decrementQuantity}
                className="quantity-btn"
                disabled={quantity <= 1}
              >
                -
              </button>

              <span className="quantity">{quantity}</span>

              <button onClick={incrementQuantity} className="quantity-btn">
                +
              </button>
            </div>

            <button onClick={handleAddToCart} className="add-to-cart-btn">
              Add to Cart
            </button>

            {cartSuccess && (
              <div className="cart-success-message">
                Added to cart successfully!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="reviews-title">Customer Reviews</h2>

        {menu.reviews && menu.reviews.length > 0 ? (
          <div className="reviews-list">
            {menu.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="review-user">{review.userName}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="review-rating">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(10 - review.rating)}
                </div>

                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default MenuDetailsPage;