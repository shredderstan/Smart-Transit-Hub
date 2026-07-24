package com.backend.smarttransithub.services;

import java.util.ArrayList;
import java.util.List;

import javax.management.RuntimeErrorException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
import com.backend.smarttransithub.exceptions.ResourceNotFoundException;
import com.backend.smarttransithub.exceptions_handler.GlobalExceptionHandler;
import com.backend.smarttransithub.repositories.BusRepository;
import com.backend.smarttransithub.repositories.RouteRepository;
import com.backend.smarttransithub.repositories.StopRepository;
import com.backend.smarttransithub.repositories.StudentRepository;
import com.backend.smarttransithub.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService{

    private final PasswordEncoder passwordEncoder;

	private final UserRepository userRepo;
	private final BusRepository busRepo;
	private final RouteRepository routeRepo;
	private final StopRepository stopRepo;
	private final StudentRepository studentRepo;
	
    AdminServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

	@Override
	public List<User> getUsers(Role role) {
		
		if(role == null)
			return userRepo.findAll();
		else
			return userRepo.findByRole(role);
	}

	@Override
	public User createUser(UserRequest request) {
		User user = new User();
		
		if(!userRepo.findByUsername(request.getUsername()).isEmpty())
			throw new RuntimeException("Username already exists");
		
		user.setUsername(request.getUsername());
		user.setPasswordHash(request.getPassword());
		user.setFullName(request.getFullName());
		user.setPhoneNumber(request.getPhoneNumber());
		user.setRole(request.getRole());
		user.setIsActive(true);
		
		return userRepo.save(user);
	}

	@Override
	public User updateUser(Long id, UserRequest request) {
		
		User user = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		user.setUsername(request.getUsername());
	    user.setFullName(request.getFullName());
	    user.setPhoneNumber(request.getPhoneNumber());
	    user.setRole(request.getRole());		// this means only admin can update, should change
	    
	    if(request.getPassword() != null && request.getPassword() != "")
	    	user.setPasswordHash(passwordEncoder.encode(request.getPassword()));	
	    
	    // can create a different dto for update only where password can be null idk
	    
	    return userRepo.save(user);
	    
	}

	@Override
	public void deleteUser(Long id) {
		
		User user = userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
		
		user.setIsActive(false);
		
		userRepo.save(user);
		
	}
	
	// BUSES

	@Override
	public List<Bus> getBuses() {
		return busRepo.findAll();
	}

	@Override
	public Bus createbus(BusRequest request) {		
		
		if(busRepo.existsByBusNumber(request.getBusNumber()))
			throw new RuntimeException("Bus number already exists");
		
		if(busRepo.existsByPlateNumber(request.getPlateNumber()))
			throw new RuntimeException("Plate number already exists");
		
		User driver = userRepo.findById(request.getDriverUserId()).orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
		
		Route route = routeRepo.findById(request.getRouteId()).orElseThrow(() -> new ResourceNotFoundException("Route Not found"));
		
		Bus bus = new Bus();
		
		bus.setBusNumber(request.getBusNumber());
		bus.setPlateNumber(request.getPlateNumber());
		bus.setCapacity(request.getCapacity());
		bus.setDriver(driver);
		bus.setRoute(route);
		
		return busRepo.save(bus);
		
	}
	
	@Override
	public Bus updateBus(Long id, BusRequest request) {

	    Bus bus = busRepo.findById(id)
	            .orElseThrow(() -> new RuntimeException("Bus not found"));

	    User driver = userRepo.findById(request.getDriverUserId())
	            .orElseThrow(() -> new RuntimeException("Driver not found"));

	    if (driver.getRole() != Role.ROLE_DRIVER) {
	        throw new RuntimeException("Selected user is not a driver");
	    }

	    Route route = routeRepo.findById(request.getRouteId())
	            .orElseThrow(() -> new RuntimeException("Route not found"));

	    bus.setBusNumber(request.getBusNumber());
	    bus.setPlateNumber(request.getPlateNumber());
	    bus.setCapacity(request.getCapacity());
	    bus.setDriver(driver);
	    bus.setRoute(route);

	    return busRepo.save(bus);
	}

	@Override
	public void deleteBus(Long id) {
		Bus bus = busRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

	    busRepo.delete(bus);
	}

	@Override
	public List<Route> getRoutes() {
	    return routeRepo.findAll();
	}

	@Override
	public Route createRoute(RouteRequest request) {

		if(routeRepo.existsByRouteName(request.getRouteName()))
			throw new RuntimeException("Route already exists");
		
	    Route route = new Route();
	    route.setRouteName(request.getRouteName());
	    return routeRepo.save(route);
	}

	@Override
	public Route updateRoute(Long id, RouteRequest request) {

	    Route route = routeRepo.findById(id).orElseThrow(() -> new RuntimeException("Route not found"));
	    route.setRouteName(request.getRouteName());
	    return routeRepo.save(route);
	}

	@Override
	public void deleteRoute(Long id) {

	    Route route = routeRepo.findById(id).orElseThrow(() -> new RuntimeException("Route not found"));

	    routeRepo.delete(route);
	}

	@Override
	public List<Stop> getStops(Long routeId) {
		Route route = routeRepo.findById(routeId).orElseThrow(() -> new RuntimeException("Route not found"));

	    return stopRepo.findByRouteOrderBySequenceOrder(route);
	}

	@Override
	public List<Stop> saveStops(Long routeId, List<StopRequest> request) {

	    Route route = routeRepo.findById(routeId).orElseThrow(() -> new RuntimeException("Route not found"));

	    List<Stop> stops = new ArrayList<>();

	    for (StopRequest dto : request) {

	        Stop stop = new Stop();

	        stop.setRoute(route);
	        stop.setStopName(dto.getStopName());
	        stop.setLatitude(dto.getLatitude());
	        stop.setLongitude(dto.getLongitude());
	        stop.setSequenceOrder(dto.getSequenceOrder());

	        stops.add(stop);
	    }

	    return stopRepo.saveAll(stops);
	}

	@Override
	public List<Student> getStudents() {
	    return studentRepo.findAll();
	}

	@Override
	public Student createStudent(StudentRequest request) {

	    User parent = userRepo.findById(request.getParentId()).orElseThrow(() -> new RuntimeException("Parent not found"));

	    Stop stop = stopRepo.findById(request.getStopId()).orElseThrow(() -> new RuntimeException("Stop not found"));

	    Student student = new Student();

	    student.setFirstName(request.getFirstName());
	    student.setLastName(request.getLastName());
	    student.setRollNumber(request.getRollNumber());
	    student.setParent(parent);
	    student.setStop(stop);

	    return studentRepo.save(student);
	}
	
	@Override
	public Student updateStudent(Long id, StudentRequest request) {

	    Student student = studentRepo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

	    User parent = userRepo.findById(request.getParentId()).orElseThrow(() -> new RuntimeException("Parent not found"));

	    Stop stop = stopRepo.findById(request.getStopId()).orElseThrow(() -> new RuntimeException("Stop not found"));

	    student.setFirstName(request.getFirstName());
	    student.setLastName(request.getLastName());
	    student.setRollNumber(request.getRollNumber());
	    student.setParent(parent);
	    student.setStop(stop);

	    return studentRepo.save(student);
	}

	@Override
	public void deleteStudent(Long id) {

	    Student student = studentRepo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

	    studentRepo.delete(student);
	}

}
