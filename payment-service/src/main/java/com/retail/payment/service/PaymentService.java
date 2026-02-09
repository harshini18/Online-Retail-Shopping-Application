package com.retail.payment.service;

import com.retail.payment.entity.Payment;
import java.util.List;

public interface PaymentService {
    Payment processPayment(Payment payment);

    List<Payment> getUserPayments(Long userId);
}
