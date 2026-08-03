package com.backend.smarttransithub.services;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.backend.smarttransithub.dtos.response.PlaceResponseDto;


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

        String url = "https://nominatim.openstreetmap.org/search?q=" + query.trim() + "&format=json&limit=5";

        try{
            return restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<PlaceResponseDto>>() {});
        }
        catch (Exception e) {
            System.err.println("Error occurred while searching for places: " + e.getMessage());
            return List.of(); // Return an empty list in case of error}
        }
    }

}
