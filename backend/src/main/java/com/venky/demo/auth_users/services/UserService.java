package com.venky.demo.auth_users.services;


import com.venky.demo.auth_users.dtos.UserDTO;
import com.venky.demo.auth_users.entity.User;
import com.venky.demo.response.Response;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface UserService {

    User getCurrentLoggedInUser();

    Response<List<UserDTO>> getAllUsers();

    Response<UserDTO> getOwnAccountDetails();

    Response<?> updateOwnAccount(UserDTO userDTO) throws BadRequestException;

    Response<?> deactivateOwnAccount();


}
