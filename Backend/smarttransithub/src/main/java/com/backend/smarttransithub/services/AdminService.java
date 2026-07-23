package com.backend.smarttransithub.services;

import java.util.List;

import com.backend.smarttransithub.dtos.request.BusRequest;
import com.backend.smarttransithub.dtos.request.RouteRequest;
import com.backend.smarttransithub.dtos.request.StopRequest;
import com.backend.smarttransithub.dtos.request.StudentRequest;
import com.backend.smarttransithub.dtos.request.UserRequest;
import com.backend.smarttransithub.entities.Bus;
import com.backend.smarttransithub.entities.Route;
import com.backend.smarttransithub.entities.Stop;
import com.backend.smarttransithub.entities.Student;
import com.backend.smarttransithub.entities.User;
import com.backend.smarttransithub.enums.Role;



public interface AdminService {
	List<User> getUsers(Role role);
	User createUser(UserRequest request);
	User updateUser(Long id, UserRequest request);
	void deleteUser(Long id);
	
	List<Bus> getBuses();
	Bus createbus(BusRequest request);
	Bus updateBus(Long id, BusRequest request);
	void deleteBus(Long id);
	
	List<Route> getRoutes();
	Route createRoute(RouteRequest request);
	Route updateRoute(Long id, RouteRequest request);
	void deleteRoute(Long id);
	
	List<Stop> getStops(Long routeId);
	List<Stop> saveStops(Long routeId, List<StopRequest> request);
	
	List<Student> getStudents();
	Student createStudent(StudentRequest request);
	Student updateStudent(Long id, StudentRequest request);
	void deleteStudent(Long id);
}
