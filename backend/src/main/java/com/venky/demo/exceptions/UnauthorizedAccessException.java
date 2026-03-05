package com.venky.demo.exceptions;

public class UnauthorizedAccessException extends RuntimeException{

    public UnauthorizedAccessException(String message){

        super(message);
    }
}
