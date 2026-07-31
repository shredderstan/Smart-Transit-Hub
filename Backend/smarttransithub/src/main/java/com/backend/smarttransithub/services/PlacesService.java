package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.response.PlaceResponseDto;

public interface PlacesService {

    public List<PlaceResponseDto> searchPlaces(String query);
}
