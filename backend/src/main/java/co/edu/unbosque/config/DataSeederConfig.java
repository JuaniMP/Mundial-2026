package co.edu.unbosque.config;

import co.edu.unbosque.service.DataSeederService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeederConfig {

    private final DataSeederService dataSeederService;

    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> {
            log.info("🚀 CommandLineRunner bean invoked - starting database seeding");
            System.out.println("🚀 [SEEDER] CommandLineRunner bean invoked - starting database seeding");
            try {
                dataSeederService.seedDatabase();
                log.info("✅ Database seeding completed successfully");
                System.out.println("✅ [SEEDER] Database seeding completed successfully");
            } catch (Exception e) {
                log.error("❌ Error during database seeding", e);
                System.err.println("❌ [SEEDER] Error during database seeding: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
