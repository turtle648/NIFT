package com.e101.nift.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, CustomUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws IOException {
        try {
            log.info("요청 경로: {}", request.getRequestURI());

            String path = request.getRequestURI();

            if (path.startsWith("/api/admin/")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = resolveToken(request);
            log.info("[JwtAuthenticationFilter] token {}", token);
            if (token != null) {
                if (!jwtTokenProvider.validateToken(token)) {
                    throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
                }

                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(userId.toString());
                if (userDetails instanceof CustomUserDetails customUserDetails) {
                    Authentication authentication =
                            new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.error("userDetails is not CustomUserDetails. Authentication not set.");
                }
            }

            log.info("[JwtAuthenticationFilter] 필터 통과 후 다음 필터/서블릿으로 전달됨");
            filterChain.doFilter(request, response);

        } catch (UsernameNotFoundException | IllegalArgumentException e) {
            log.warn("Authentication failed: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\": \"Invalid or expired token.\"}");
        } catch (Exception e) {
            log.error("Cannot set user authentication", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\": \"Authentication error.\"}");
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        return (bearerToken != null && bearerToken.startsWith("Bearer ")) ? bearerToken.substring(7) : null;
    }
}
