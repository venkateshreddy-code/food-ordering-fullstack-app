package com.venky.demo.cart.services;

import com.venky.demo.cart.dtos.CartDTO;
import com.venky.demo.response.Response;

public interface CartService {

    Response<?> addItemToCart(CartDTO cartDTO);

    Response<?> incrementItem(Long menuId);

    Response<?> decrementItem(Long menuId);

    Response<?> removeItem(Long cartItemId);

    Response<CartDTO> getShoppingCart();

    Response<?> clearShoppingCart();
}
