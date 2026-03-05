package com.venky.demo.payment.services;

import com.venky.demo.payment.dtos.PaymentDTO;
import com.venky.demo.response.Response;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface PaymentService {
    Response<?> initializePayment(PaymentDTO paymentDTO) throws BadRequestException;
    void updatePaymentForOrder(PaymentDTO paymentDTO);
    Response<List<PaymentDTO>> getAllPayments();
    Response<PaymentDTO> getPaymentById(Long paymentId);

}
