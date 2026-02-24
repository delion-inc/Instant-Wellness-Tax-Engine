package com.example.server.config;

import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${app.base-url}")
    private String baseUrl;

    @Bean
    public OpenAPI api() {
        return new OpenAPI()
                .servers(
                        List.of(
                                new Server().url(baseUrl)
                        )
                )
                .info(
                        new Info().title("Our users API")
                );
    }
}
