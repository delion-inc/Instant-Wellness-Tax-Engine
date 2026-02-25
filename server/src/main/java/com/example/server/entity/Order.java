package com.example.server.entity;

import com.example.server.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.example.server.dto.order.SpecialRateEntry;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id")
    private Long externalId;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(nullable = false)
    private Long timestamp;

    @Column(nullable = false, precision = 14, scale = 4)
    private BigDecimal subtotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.ADDED;

    @Column(name = "csv_imported", nullable = false)
    @Builder.Default
    private boolean csvImported = false;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "composite_tax_rate", precision = 8, scale = 6)
    private BigDecimal compositeTaxRate;

    @Column(name = "tax_amount", precision = 14, scale = 4)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", precision = 14, scale = 4)
    private BigDecimal totalAmount;

    @Column(name = "state_rate", precision = 8, scale = 6)
    private BigDecimal stateRate;

    @Column(name = "county_rate", precision = 8, scale = 6)
    private BigDecimal countyRate;

    @Column(name = "city_rate", precision = 8, scale = 6)
    private BigDecimal cityRate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "special_rates", columnDefinition = "jsonb")
    private List<SpecialRateEntry> specialRates;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "jurisdictions", columnDefinition = "jsonb")
    private Map<String, Object> jurisdictions;
}
