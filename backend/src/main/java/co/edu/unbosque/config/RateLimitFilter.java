package co.edu.unbosque.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter — Bucket4j token-bucket algorithm.
 *
 * <p>Strategy:
 * <ul>
 *   <li>Key = JWT subject (email) when authenticated, else client IP address.</li>
 *   <li>Each bucket allows {@code requestsPerMinute} tokens, refilled every minute.</li>
 *   <li>A burst of up to {@code burstCapacity} tokens is allowed instantly.</li>
 *   <li>The Stripe webhook endpoint is exempted (Stripe signature validation protects it).</li>
 * </ul>
 *
 * <p>In-memory ConcurrentHashMap: suitable for single-node deployments.
 * For multi-node, replace with Bucket4j + Redis/Hazelcast distributed cache.
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${rate.limit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${rate.limit.burst-capacity:20}")
    private int burstCapacity;

    /** Buckets keyed by identity (email or IP). Cleaned up on capacity pressure by JVM GC
     *  (ConcurrentHashMap is unbounded; for production add a Caffeine expiry cache). */
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Endpoints that should NOT be rate-limited
    private static final String[] EXEMPT_PREFIXES = {
            "/api/v1/entradas/webhook",   // Stripe validates signature
            "/actuator/health",
            "/swagger-ui",
            "/v3/api-docs",
    };

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip rate limiting for exempted paths
        for (String exempt : EXEMPT_PREFIXES) {
            if (path.startsWith(exempt)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        String key = resolveKey(request);
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket());

        if (bucket.tryConsume(1)) {
            // Add rate-limit info headers (useful for API clients)
            long remaining = bucket.getAvailableTokens();
            response.addHeader("X-RateLimit-Limit",     String.valueOf(requestsPerMinute));
            response.addHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            filterChain.doFilter(request, response);
        } else {
            log.warn("[RateLimit] Limit exceeded for key={} path={}", key, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Límite: "
                    + requestsPerMinute + " req/min. Espera un momento e inténtalo de nuevo.\"}"
            );
        }
    }

    /**
     * Resolve the rate-limit key.
     * Uses the JWT subject (email) when a Bearer token is present,
     * otherwise falls back to the client IP address.
     */
    private String resolveKey(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            // Extract subject from JWT payload (base64 middle part) without validating —
            // validation is done by JwtAuthFilter downstream. We just need a stable key.
            try {
                String payload = auth.split("\\.")[1];
                // Base64-decode the payload and extract "sub"
                String decoded = new String(
                        java.util.Base64.getUrlDecoder().decode(payload));
                com.fasterxml.jackson.databind.JsonNode node =
                        new com.fasterxml.jackson.databind.ObjectMapper().readTree(decoded);
                if (node.has("sub")) {
                    return "user:" + node.get("sub").asText();
                }
            } catch (Exception ignored) {
                // Malformed token — fall through to IP
            }
        }
        // Fall back to IP (respects X-Forwarded-For for reverse proxies)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        return "ip:" + (xForwardedFor != null
                ? xForwardedFor.split(",")[0].trim()
                : request.getRemoteAddr());
    }

    private Bucket newBucket() {
        // Steady refill: requestsPerMinute tokens per minute
        Bandwidth steadyRate = Bandwidth.classic(
                requestsPerMinute,
                Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
        );
        // Burst allowance: up to burstCapacity extra tokens available instantly
        Bandwidth burst = Bandwidth.classic(
                requestsPerMinute + burstCapacity,
                Refill.greedy(requestsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(steadyRate)
                .addLimit(burst)
                .build();
    }
}
