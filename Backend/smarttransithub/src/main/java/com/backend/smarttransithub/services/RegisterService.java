package com.backend.smarttransithub.services;

import com.backend.smarttransithub.dtos.request.RegisterDto;
import com.backend.smarttransithub.dtos.response.ApiResponse;

public interface RegisterService {
	ApiResponse addUser(RegisterDto request);
}
