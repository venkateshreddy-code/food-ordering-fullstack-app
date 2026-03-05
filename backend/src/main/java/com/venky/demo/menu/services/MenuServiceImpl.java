package com.venky.demo.menu.services;

import com.venky.demo.aws.AWSS3Service;
import com.venky.demo.category.entity.Category;
import com.venky.demo.category.repository.CategoryRepository;
import com.venky.demo.exceptions.NotFoundException;
import com.venky.demo.menu.dtos.MenuDTO;
import com.venky.demo.menu.entity.Menu;
import com.venky.demo.menu.repository.MenuRepository;
import com.venky.demo.response.Response;
import com.venky.demo.review.dtos.ReviewDTO;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class MenuServiceImpl implements MenuService {
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    private final AWSS3Service awsS3Service;


    @Override
    public Response<MenuDTO> createMenu(MenuDTO menuDTO) throws BadRequestException {
        log.info("Inside createMenu()");

        Category category = categoryRepository.findById(menuDTO.getCategoryId()).orElseThrow(() -> new NotFoundException("Category Not Found"));

        String imageUrl = null;
        MultipartFile imageFile = menuDTO.getImageFile();

        if (imageFile == null || imageFile.isEmpty()) {
            throw new BadRequestException("Menu Image is Required");
        }

        String imageName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

        URL s3Url = awsS3Service.uploadFile("menus/" + imageName, imageFile);
        imageUrl = s3Url.toString();

        Menu menu = Menu.builder()
                .name(menuDTO.getName())
                .description(menuDTO.getDescription())
                .price(menuDTO.getPrice())
                .imageUrl(imageUrl)
                .category(category)
                .build();

        Menu savedMenu = menuRepository.save(menu);

        return Response.<MenuDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Menu created successfully")
                .data(modelMapper.map(savedMenu, MenuDTO.class))
                .build();


    }

    @Override
    public Response<MenuDTO> updateMenu(MenuDTO menuDTO) {
        log.info("Inside updateMenu()");
        Menu existingMenu = menuRepository.findById(menuDTO.getId())
                .orElseThrow(() -> new NotFoundException("Menu not found"));

        Category category = categoryRepository.findById(menuDTO.getCategoryId())
                .orElseThrow(() -> new
                        NotFoundException("Category Not Found"));
        String imageUrl = existingMenu.getImageUrl();
        MultipartFile imageFile = menuDTO.getImageFile();

        if (imageFile != null && !imageFile.isEmpty()) {

            if (imageUrl != null && !imageUrl.isBlank()) {
                String oldFileName =
                        imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                awsS3Service.deleteFile("menus/" + oldFileName);
                log.info("Deleted old menu image from S3");
            }
            String imageName = UUID.randomUUID() + "_" +
                    imageFile.getOriginalFilename();
            URL newImageUrl = awsS3Service.uploadFile("menus/" + imageName, imageFile);
            imageUrl = newImageUrl.toString();
        }
        if (menuDTO.getName() != null && !menuDTO.getName().isBlank()) {
            existingMenu.setName(menuDTO.getName());
        }
        if (menuDTO.getDescription() != null && !menuDTO.getDescription().isBlank()) {
            existingMenu.setDescription(menuDTO.getDescription());
        }
        if (menuDTO.getPrice() != null) {
            existingMenu.setPrice(menuDTO.getPrice());
        }

        existingMenu.setImageUrl(imageUrl);
        existingMenu.setCategory(category);

        Menu updatedMenu = menuRepository.save(existingMenu);

        return Response.<MenuDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Menu updated successfully")
                .data(modelMapper.map(updatedMenu, MenuDTO.class))
                .build();

    }

    @Override
    public Response<MenuDTO> getMenuById(Long id) {

        log.info("Inside getMenuById()");

        Menu existingMenu = menuRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu not found"));

        MenuDTO menuDTO = modelMapper.map(existingMenu, MenuDTO.class);

        if (menuDTO.getReviews() != null) {
            menuDTO.getReviews()
                    .sort(Comparator.comparing(ReviewDTO::getId).reversed());
        }
        return Response.<MenuDTO>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Menu retrieved successfully")
                .data(menuDTO)
                .build();
    }

    @Override
    public Response<?> deleteMenu(Long id) {
        log.info("Inside deleteMenu()");

        Menu menuToDelete = menuRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu not found"));

        String imageUrl = menuToDelete.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {

            String keyName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            awsS3Service.deleteFile("menus/" + keyName);
            log.info("Deleted image from S3: menus/" + keyName);
        }
        menuRepository.deleteById(id);
        return Response.builder()
                .statusCode(HttpStatus.OK.value())
                .message("Menu deleted successfully")
                .build();
    }

    @Override
    public Response<List<MenuDTO>> getMenus(Long categoryId, String search) {
        System.out.println("CATEGORY ID RECEIVED: " + categoryId);

        log.info("Inside getMenus()");

        Specification<Menu> spec = buildSpecification(categoryId, search);

        Sort sort = Sort.by(Sort.Direction.DESC, "id");

        List<Menu> menuList = menuRepository.findAll(spec, sort);

        List<MenuDTO> menuDTOS = menuList.stream()
                .map(menu -> modelMapper.map(menu, MenuDTO.class))
                .toList();

        return Response.<List<MenuDTO>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Menus retrieved")
                .data(menuDTOS)
                .build();

    }

    private Specification<Menu> buildSpecification(Long categoryId, String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(
                        cb.equal(root.get("category").get("id"), categoryId)
                );
            }

            if (search != null && !search.isBlank()) {
                String searchTerm = "%" + search.toLowerCase() + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("name")), searchTerm),
                                cb.like(cb.lower(root.get("description")), searchTerm)
                        )
                );
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
