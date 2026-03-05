package com.venky.demo.auth_users.services;

import com.venky.demo.auth_users.dtos.LoginRequest;

import com.venky.demo.auth_users.dtos.LoginResponse;
import com.venky.demo.auth_users.dtos.RegistrationRequest;
import com.venky.demo.response.Response;
import org.apache.coyote.BadRequestException;

public interface AuthService {
    Response<?> register(RegistrationRequest requestionRequest) throws BadRequestException;
    Response<LoginResponse> login(LoginRequest loginRequest) throws BadRequestException;


}
