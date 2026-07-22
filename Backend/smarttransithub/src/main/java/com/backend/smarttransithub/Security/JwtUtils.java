package com.smartTransit.Security;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {
	@Value("${jwt.secret.key}")
	private String secret;
	@Value("{}jwt.emp.time")
	private long expTime;
	private SecretKey key;
	
	@PostConstruct
	public void myInit()
	{
		log.info("******************** in init - generating symmetric key");
		key = Keys.hmacShaKeyFor(secret.getBytes());
	}
	
	public String generateJwt(CustomUserDetailsImpl userDetails)
	{
		Date now = new Date();
		Date expDate = new Date(now.getTime() + expTime);
		return Jwts.builder()
				.subject(userDetails.getUsername())
				.issuedAt(now)
				.expiration(expDate)
				.claims(Map.of("user_id", userDetails.getUserId(),
						"user_role",userDetails.getRole()))
				.signWith(key)
				.compact();
	}
	
	public Claims verifyJwtAndExtractClaims(String jwt)
	{
		return Jwts.parser() //creates a builder to parse JWT
				.verifyWith(key) //verifying signature
				.build() //builds JWT parser 
				.parseSignedClaims(jwt) //in case of invalid JWT - throws exception
				.getPayload();//extracting the claims
	}
	//TODO : if possible implement refresh token to avoid relogin
}














