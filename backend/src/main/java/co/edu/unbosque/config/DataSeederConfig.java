package co.edu.unbosque.config;

import co.edu.unbosque.service.DataSeederService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeederConfig {

    private final DataSeederService dataSeederService;

    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> dataSeederService.seedDatabase();
    }
}
