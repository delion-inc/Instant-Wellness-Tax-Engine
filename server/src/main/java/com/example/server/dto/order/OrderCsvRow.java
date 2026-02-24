package com.example.server.dto.order;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCsvRow {

    @CsvBindByName(column = "id")
    private String id;

    @CsvBindByName(column = "latitude", required = true)
    private String latitude;

    @CsvBindByName(column = "longitude", required = true)
    private String longitude;

    @CsvBindByName(column = "timestamp", required = true)
    private String timestamp;

    @CsvBindByName(column = "subtotal", required = true)
    private String subtotal;
}
