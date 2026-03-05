package com.venky.demo;

import com.venky.demo.email_notification.dtos.NotificationDTO;
import com.venky.demo.email_notification.services.NotificationService;
import com.venky.demo.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
//@RequiredArgsConstructor
public class FoodAppApplication {

   // private final NotificationService notificationService;

	public static void main(String[] args) {

        SpringApplication.run(FoodAppApplication.class, args);
	}

 //   @Bean
   // CommandLineRunner runner(){
     //   return args -> {
       //     NotificationDTO notificationDTO = NotificationDTO.builder()
         //           .recipient("venkateshreddyningam@gmail.com")
           //         .subject("Hello venky")
             //       .body("Hey this is a test email")
               //     .type(NotificationType.EMAIL)
                 //   .build();

      //      notificationService.sendEmail(notificationDTO);
        //};

  //  }

}
