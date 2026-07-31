package com.backend.smarttransithub.controllers;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.smarttransithub.dtos.response.PlaceResponseDto;
import com.backend.smarttransithub.services.PlacesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
public class PlacesController {

    private final PlacesService placesService;   

    @GetMapping("/search")
    public ResponseEntity<List<PlaceResponseDto>> searchPlaces(@RequestParam("query") String query) {
        List<PlaceResponseDto> results = placesService.searchPlaces(query);
        return ResponseEntity.ok(results);
    }
}
