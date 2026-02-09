package com.retail.payment.service.impl;

import com.retail.payment.entity.Payment;
import com.retail.payment.repository.PaymentRepository;
import com.retail.payment.service.PaymentService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Payment processPayment(Payment payment) {
        payment.setStatus("SUCCESS"); // Simplified for now
        payment.setTransactionId("TXN" + System.currentTimeMillis());
        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
}
