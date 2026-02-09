package com.retail.notification.service;

import com.retail.notification.entity.Notification;
import java.util.List;

public interface NotificationService {
    Notification sendNotification(Notification notification);

    List<Notification> getUserNotifications(Long userId);
}
