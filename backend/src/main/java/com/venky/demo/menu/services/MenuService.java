package com.venky.demo.menu.services;

import com.venky.demo.menu.dtos.MenuDTO;
import com.venky.demo.response.Response;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface MenuService  {

    Response<MenuDTO> createMenu(MenuDTO menuDTO) throws BadRequestException;
    Response<MenuDTO> updateMenu(MenuDTO menuDTO);
    Response<MenuDTO> getMenuById(Long id);
    Response<?> deleteMenu(Long id);
    Response<List<MenuDTO>> getMenus(Long categoryId, String search);
}
