package com.example.server.repository;

import com.example.server.dto.order.OrderFilterParams;
import com.example.server.entity.Order;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    private OrderSpecification() {}

    public static Specification<Order> from(OrderFilterParams f) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (f.getCsvImported() != null) {
                predicates.add(cb.equal(root.get("csvImported"), f.getCsvImported()));
            }

            if (f.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), f.getStatus()));
            }

            if (f.getTimestampFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), f.getTimestampFrom()));
            }

            if (f.getTimestampTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), f.getTimestampTo()));
            }

            if (f.getTaxAmountMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("taxAmount"), f.getTaxAmountMin()));
            }

            if (f.getTaxAmountMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("taxAmount"), f.getTaxAmountMax()));
            }

            if (f.getCompositeTaxRateMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("compositeTaxRate"), f.getCompositeTaxRateMin()));
            }

            if (f.getCompositeTaxRateMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("compositeTaxRate"), f.getCompositeTaxRateMax()));
            }

            // --- Jurisdiction filters (JSONB) ---

            if (f.getJurState() != null) {
                Expression<String> expr = cb.function("jsonb_extract_path_text", String.class,
                        root.get("jurisdictions"), cb.literal("state"));
                predicates.add(cb.equal(cb.lower(expr), f.getJurState().strip().toLowerCase()));
            }

            if (f.getJurCounty() != null) {
                Expression<String> expr = cb.function("jsonb_extract_path_text", String.class,
                        root.get("jurisdictions"), cb.literal("county"));
                predicates.add(cb.equal(cb.lower(expr), f.getJurCounty().strip().toLowerCase()));
            }

            if (f.getJurCity() != null) {
                Expression<String> expr = cb.function("jsonb_extract_path_text", String.class,
                        root.get("jurisdictions"), cb.literal("city"));
                predicates.add(cb.equal(cb.lower(expr), f.getJurCity().strip().toLowerCase()));
            }

            // jurSpecial: check that the JSON array text contains the quoted value
            // e.g. '["MCTD","Other"]' LIKE '%"MCTD"%'
            if (f.getJurSpecial() != null) {
                Expression<String> expr = cb.function("jsonb_extract_path_text", String.class,
                        root.get("jurisdictions"), cb.literal("special"));
                predicates.add(cb.like(expr, "%\"" + f.getJurSpecial().strip() + "\"%"));
            }

            // hasSpecial: special array is non-null and not empty
            if (f.getHasSpecial() != null) {
                Expression<String> specialText = cb.function("jsonb_extract_path_text", String.class,
                        root.get("jurisdictions"), cb.literal("special"));
                if (Boolean.TRUE.equals(f.getHasSpecial())) {
                    predicates.add(cb.and(
                            cb.isNotNull(specialText),
                            cb.notEqual(specialText, "[]")
                    ));
                } else {
                    predicates.add(cb.or(
                            cb.isNull(specialText),
                            cb.equal(specialText, "[]")
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
