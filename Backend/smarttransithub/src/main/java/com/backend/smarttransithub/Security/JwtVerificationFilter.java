package com.backend.smarttransithub.Security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtVerificationFilter extends OncePerRequestFilter {
	// DI
	private final JwtUtils jwtUtils;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			String header = request.getHeader("Authorization");
			if (header != null && header.startsWith("Bearer ")) {
				String jwt = header.substring(7);
				log.info("******************* jwt : ", jwt);
				Claims payload = jwtUtils.verifyJwtAndExtractClaims(jwt);

				// using claims create authentication object

				Long userId = payload.get("user_id", Long.class);
				String roleName = payload.get("user_role", String.class);
				log.info("***************** user_id : " + userId + " user_role : " + roleName);
				UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userId, null,
						List.of(new SimpleGrantedAuthority(roleName)));

				SecurityContextHolder.getContext().setAuthentication(token);
				System.out.println("token :" + token);
			}
			
			
			filterChain.doFilter(request, response);
			
		} catch (Exception e) {
			e.printStackTrace();
			// => JWT validation failure -> clear spring sec ctx holder
			SecurityContextHolder.clearContext();
			// -> send SC 401 + mesg
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);// SC 401
			response.getWriter().print("Invalid JWT - Auth Failed !!!!!!");
			return;
		}

	}

}
