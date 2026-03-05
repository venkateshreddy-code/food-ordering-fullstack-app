package com.venky.demo.order.services;

import com.venky.demo.enums.OrderStatus;
import com.venky.demo.order.dtos.OrderDTO;
import com.venky.demo.order.dtos.OrderItemDTO;
import com.venky.demo.response.Response;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;

import java.util.List;

public interface OrderService {

    Response<?> placeOrderFromCart() throws BadRequestException;

    Response<OrderDTO> getOrderById(Long id);

    Response<Page<OrderDTO>> getAllOrders(OrderStatus orderStatus, int page, int size);

    Response<List<OrderDTO>> getOrderOfUser();

    Response<OrderItemDTO> getOrderItemById(Long orderItemId);

    Response<OrderDTO> updateOrderStatus(OrderDTO orderDTO);

    Response<Long> countUniqueCustomers();


}
