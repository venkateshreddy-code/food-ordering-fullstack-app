package com.venky.demo.role.services;

import com.venky.demo.response.Response;
import com.venky.demo.role.dtos.RoleDTO;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface RoleService {

    Response<RoleDTO> createRole(RoleDTO roleDTO);

    Response<RoleDTO> updateRole(RoleDTO roleDTO) throws BadRequestException;

    Response<List<RoleDTO>> getAllRoles();

    Response<?> deleteRole(Long id);
}
