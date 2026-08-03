package com.backend.smarttransithub.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.backend.smarttransithub.dtos.response.PlaceResponseDto;
import com.fasterxml.jackson.annotation.JsonProperty;

@Service
public class PlacesServiceImps implements PlacesService {

    private final RestClient restClient;

    public PlacesServiceImps() {
        this.restClient = RestClient.builder()
                .defaultHeader("User-Agent", "SmartTransitHub/1.0 (contact@smarttransit.com)")
                .build();
    }

    @Override
    public List<PlaceResponseDto> searchPlaces(String query) {
        String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=5";

        try {
            // 1. Fetch raw response into a helper DTO structure matching OpenStreetMap keys
            List<NominatimApiResponse> rawResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<NominatimApiResponse>>() {});

            if (rawResponse == null) {
                return List.of();
            }

            // 2. Map raw response fields to your clean PlaceResponseDto structure
            return rawResponse.stream().map(item -> new PlaceResponseDto(
                item.name,
                item.displayName,
                Double.parseDouble(item.lat),
                Double.parseDouble(item.lon)
            )).collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error occurred while searching for places: " + e.getMessage());
            return List.of();
        }
    }

    // Helper private record/class to parse the external JSON structure
    private record NominatimApiResponse(
        String name,
        @JsonProperty("display_name") String displayName,
        String lat,
        String lon
    ) {}
}