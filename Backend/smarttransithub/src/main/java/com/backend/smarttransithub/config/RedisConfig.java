package com.backend.smarttransithub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class RedisConfig {

	@Bean
	public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
		RedisTemplate<String, String> template = new RedisTemplate<>();
		template.setConnectionFactory(connectionFactory);
		
		StringRedisSerializer stringSerializer = new StringRedisSerializer();
		template.setKeySerializer(stringSerializer);
		template.setHashKeySerializer(stringSerializer);
		
		template.setValueSerializer(stringSerializer);
		template.setHashValueSerializer(stringSerializer);
		
		template.afterPropertiesSet();
		return template;
	}

	@Bean
	public ChannelTopic topic() {
		return new ChannelTopic("bus-location-events");
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}
}
