package com.venky.demo.order.services;

import com.venky.demo.auth_users.entity.User;
import com.venky.demo.auth_users.services.UserService;
import com.venky.demo.cart.entity.Cart;
import com.venky.demo.cart.entity.CartItem;
import com.venky.demo.cart.repository.CartRepository;
import com.venky.demo.cart.services.CartService;
import com.venky.demo.email_notification.dtos.NotificationDTO;
import com.venky.demo.email_notification.services.NotificationService;
import com.venky.demo.enums.OrderStatus;
import com.venky.demo.enums.PaymentStatus;
import com.venky.demo.exceptions.NotFoundException;
import com.venky.demo.menu.dtos.MenuDTO;
import com.venky.demo.order.dtos.OrderDTO;
import com.venky.demo.order.dtos.OrderItemDTO;
import com.venky.demo.order.entity.Order;
import com.venky.demo.order.entity.OrderItem;
import com.venky.demo.order.repository.OrderItemRepository;
import com.venky.demo.order.repository.OrderRepository;
import com.venky.demo.response.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserService userService;
    private final CartRepository cartRepository;
    private final ModelMapper modelMapper;
    private final CartService cartService;

    private final TemplateEngine templateEngine;
    private final NotificationService notificationService;

    @Value("${base.payment.link}")
    private String basePaymentLink;



    @Override
    public Response<?> placeOrderFromCart() throws BadRequestException {

        log.info("Inside placeOrderFromCart() ");

        User customer = userService.getCurrentLoggedInUser();

        String deliveryAddress = customer.getAddress();

        if (deliveryAddress == null) {
            throw new NotFoundException("Delivery Address Not present for the user");
        }

        Cart cart = cartRepository.findByUser_Id(customer.getId())
                .orElseThrow(() -> new NotFoundException("Cart not found for the user"));

        List<CartItem> cartItems = cart.getCartItems();

        if (cartItems == null || cartItems.isEmpty()){
            throw new BadRequestException("Cart is empty");
        }

        List<OrderItem> orderItems= new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .menu(cartItem.getMenu())
                    .quantity(cartItem.getQuantity())
                    .pricePerUnit(cartItem.getPricePerUnit())
                    .subtotal(cartItem.getSubtotal())
                    .build();
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }
        Order order = Order.builder()
                .user(customer)
                .orderItems(orderItems)
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount)
                .orderStatus(OrderStatus.INITIALIZED)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        Order savedOrder = orderRepository.save(order);
        orderItems.forEach(orderItem -> orderItem.setOrder(savedOrder));
        orderItemRepository.saveAll(orderItems);

        // Clear the user's cart after the order is placed
        cartService.clearShoppingCart();


        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);

        sendOrderConfirmationEmail(customer, orderDTO);

        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Your order has been received! We've sent a secure payment link to you email. Please proceed for payment to confirm your order.")
                .build();



    }

    @Override
    public Response<OrderDTO> getOrderById(Long id) {
        log.info("Inside getOrderById()");
        Order order = orderRepository.findById(id)
                .orElseThrow(()-> new NotFoundException("Order Not Found"));

        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);

        return Response.<OrderDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Order retrieved successfully")
                .data(orderDTO)
                .build();
    }

    @Override
    public Response<Page<OrderDTO>> getAllOrders(OrderStatus orderStatus, int page, int size) {

        log.info("Inside getAllOrders()");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<Order> orderPage;

        if (orderStatus != null ){
            orderPage = orderRepository.findByOrderStatus(orderStatus, pageable);
        } else{
            orderPage = orderRepository.findAll(pageable);
        }
        Page<OrderDTO> orderDTOPage = orderPage.map(order -> {
            OrderDTO dto = modelMapper.map(order, OrderDTO.class);
            dto.getOrderItems().forEach(orderItemDTO ->
                    orderItemDTO.getMenu().setReviews(null)
            );
            return dto;
        });

        return Response.<Page<OrderDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Orders retrieved successfully")
                .data(orderDTOPage)
                .build();


    }

    @Override
    public Response<List<OrderDTO>> getOrderOfUser() {
        log.info("Inside getOrdersOfUser()");

        User customer = userService.getCurrentLoggedInUser();


        List<Order> orders = orderRepository
                .findByUserOrderByOrderDateDesc(customer);

        List<OrderDTO> orderDTOS = orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .toList();

        orderDTOS.forEach(orderDTO -> {
            orderDTO.setUser(null);
            orderDTO.getOrderItems().forEach(item ->
                    item.getMenu().setReviews(null)
            );
        });

        return Response.<List<OrderDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Orders for user retrieved successfully")
                .data(orderDTOS)
                .build();

    }

    @Override
    public Response<OrderItemDTO> getOrderItemById(Long orderItemId) {

        log.info("Inside getOrderItemById()");

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new NotFoundException("Order Item Not Found"));

        OrderItemDTO orderItemDTO = modelMapper.map(orderItem, OrderItemDTO.class);

        // ✅ Map Menu
        MenuDTO menuDTO = modelMapper.map(orderItem.getMenu(), MenuDTO.class);

        // ✅ IMPORTANT: Make sure reviews are loaded + mapped correctly
        if (orderItem.getMenu().getReviews() != null) {
            menuDTO.setReviews(
                    orderItem.getMenu().getReviews().stream()
                            .map(review -> modelMapper.map(review, com.venky.demo.review.dtos.ReviewDTO.class))
                            .toList()
            );
        }

        orderItemDTO.setMenu(menuDTO);

        return Response.<OrderItemDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("OrderItem retrieved successfully")
                .data(orderItemDTO)
                .build();
    }

    @Override
    public Response<OrderDTO> updateOrderStatus(OrderDTO orderDTO) {
        log.info("Inside updateOrderStatus()");

        Order order = orderRepository.findById(orderDTO.getId())
                .orElseThrow(() -> new NotFoundException("Order not found: "));

        OrderStatus orderStatus = orderDTO.getOrderStatus();
        order.setOrderStatus(orderStatus);

        Order savedOrder = orderRepository.save(order);

        OrderDTO updatedOrderDTO = modelMapper.map(savedOrder, OrderDTO.class);


        return Response.<OrderDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Order status updated successfully")
                .data(updatedOrderDTO)
                .build();

    }

    @Override
    public Response<Long> countUniqueCustomers() {
        log.info("Inside countUniqueCustomers()");

        long uniqueCustomerCount = orderRepository.countDistinctUser();
        return Response.<Long>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Unique customer count retrieved successfully")
                .data(uniqueCustomerCount)
                .build();
    }

    public void sendOrderConfirmationEmail(User customer, OrderDTO orderDTO){
        String subject = "Your Order Confirmation - Order #" + orderDTO.getId();

        Context context = new Context(Locale.getDefault());
        context.setVariable("customerName", customer.getName());
        context.setVariable("orderId",String.valueOf(orderDTO.getId()));
        context.setVariable("orderDate", orderDTO.getOrderDate().toString());
        context.setVariable("totalAmount", orderDTO.getTotalAmount().toString());

        String deliveryAddress = orderDTO.getUser().getAddress();
        context.setVariable("deliveryAddress", deliveryAddress);

        context.setVariable("currentYear", java.time.Year.now());

        // Build HTML for each order item
        StringBuilder orderItemsHtml = new StringBuilder();
        for(OrderItemDTO item : orderDTO.getOrderItems()) {
            orderItemsHtml.append("<div class=\"order-item\">")
                    .append("<p>").append(item.getMenu().getName()).append(" x ")
                    .append(item.getQuantity()).append("</p>")
                    .append("<p>$").append(item.getSubtotal()).append("</p>")
                    .append("</div>");
        }

        context.setVariable("orderItemsHtml", orderItemsHtml.toString());
        context.setVariable("totalItems",orderDTO.getOrderItems().size());

        //Payment link
        String paymentLink = basePaymentLink + orderDTO.getId()
                +"&amount=" + orderDTO.getTotalAmount().toPlainString();

        context.setVariable("paymentLink" , paymentLink);


        String emailBody = templateEngine.process("order-confirmation",context);


        notificationService.sendEmail(
                NotificationDTO.builder()
                        .recipient(customer.getEmail())
                        .subject(subject)
                        .body(emailBody)
                        .isHtml(true)
                        .build()

        );
    }
}
