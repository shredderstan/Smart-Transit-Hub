package com.backend.smarttransithub.services;

import com.backend.smarttransithub.dtos.request.LoginDto;
import com.backend.smarttransithub.dtos.response.AuthResp;

public interface AuthService {
	AuthResp authenticateUser(LoginDto request);
}
