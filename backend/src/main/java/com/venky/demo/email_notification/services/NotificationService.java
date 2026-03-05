package com.venky.demo.email_notification.services;

import com.venky.demo.email_notification.dtos.NotificationDTO;

public interface NotificationService {
    void sendEmail(NotificationDTO notificationDTO);
}
