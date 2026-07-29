package com.backend.smarttransithub.controllers;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.response.PlaceResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/admin/places")
public class PlacesController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(4))
            .build();

    @GetMapping("/search")
    public ResponseEntity<List<PlaceResponseDto>> searchPlaces(@RequestParam("query") String query) {
        List<PlaceResponseDto> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(results);
        }

        String trimmedQuery = query.trim();

        // 1. Try OpenStreetMap Nominatim API
        try {
            String encodedQuery = URLEncoder.encode(trimmedQuery, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + encodedQuery
                    + "&format=json&addressdetails=1&limit=8";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "SmartTransitHub/1.0 (contact@smarttransithub.com)")
                    .header("Accept", "application/json")
                    .GET()
                    .timeout(Duration.ofSeconds(4))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isArray() && root.size() > 0) {
                    for (JsonNode node : root) {
                        String name = node.has("name") && !node.get("name").asText().isEmpty()
                                ? node.get("name").asText()
                                : node.path("display_name").asText().split(",")[0];

                        String address = node.path("display_name").asText();
                        double lat = Double.parseDouble(node.path("lat").asText("0.0"));
                        double lon = Double.parseDouble(node.path("lon").asText("0.0"));

                        results.add(new PlaceResponseDto(name, address, lat, lon));
                    }
                    return ResponseEntity.ok(results);
                }
            }
        } catch (Exception e) {
            System.err.println("Nominatim search fallback: " + e.getMessage());
        }

        // 2. Fallback to OpenStreetMap Photon API (Komoot)
        try {
            String encodedQuery = URLEncoder.encode(trimmedQuery, StandardCharsets.UTF_8);
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

                        String name = props.has("name") ? props.get("name").asText() : trimmedQuery;
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

        return ResponseEntity.ok(results);
    }
}
