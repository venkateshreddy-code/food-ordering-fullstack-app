package com.venky.demo.exceptions;

public class PaymentProcessingException extends RuntimeException{

    public PaymentProcessingException(String message){

        super(message);
    }
}
