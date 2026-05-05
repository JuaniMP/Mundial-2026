package co.edu.unbosque;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class Mundial2026HubApplication {

    public static void main(String[] args) {
        SpringApplication.run(Mundial2026HubApplication.class, args);
    }
}
