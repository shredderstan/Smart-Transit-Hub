package com.backend.smarttransithub.services;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.smarttransithub.dtos.response.PlaceResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlacesServiceImps implements PlacesService {

     private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(4))
            .build();
    @Override
    public List<PlaceResponseDto> searchPlaces(String query) {
        List<PlaceResponseDto> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return results;
        }
        try {
            String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            String url = "https://photon.komoot.io/api/?q=" + encodedQuery + "&limit=8";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "SmartTransitHub/1.0")
                    .header("Accept", "application/json")
                    .GET()
                    .timeout(Duration.ofSeconds(4))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode features = root.path("features");
                if (features.isArray()) {
                    for (JsonNode feature : features) {
                        JsonNode props = feature.path("properties");
                        JsonNode geom = feature.path("geometry").path("coordinates");
                        String name = props.has("name") ? props.get("name").asText() : query;
                        String city = props.has("city") ? props.get("city").asText() : "";
                        String country = props.has("country") ? props.get("country").asText() : "";
                        String address = String.join(", ", name, city, country).replaceAll("(, )+", ", ").trim();
                        double lon = geom.has(0) ? geom.get(0).asDouble() : 0.0;
                        double lat = geom.has(1) ? geom.get(1).asDouble() : 0.0;
                        results.add(new PlaceResponseDto(name, address, lat, lon));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Photon search error: " + e.getMessage());
        }
        return results;
    }

}
