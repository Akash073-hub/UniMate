package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

  @Autowired
  private UserRepo userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private JwtService jwtService;

  public LoginResponse login(LoginRequest request) {
    // Validate .edu email domain
    if (!request.getEmail().endsWith(".edu")) {
      return new LoginResponse(null, null, "Only .edu email addresses are allowed", false);
    }

    Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

    if (userOptional.isEmpty()) {
      return new LoginResponse(null, null, "User not found", false);
    }

    User user = userOptional.get();

    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      return new LoginResponse(null, null, "Invalid credentials", false);
    }

    // Check if user is verified
    if (!user.isVerified()) {
      return new LoginResponse(null, null, "Please verify your email first", false);
    }

    // Generate JWT token
    String token = jwtService.generateToken(user.getEmail());

    return new LoginResponse(token, user.getEmail(), "Login successful", true);
  }

  public LoginResponse register(RegisterRequest request) {
    // Validate .edu email domain
    if (!request.getEmail().endsWith(".edu")) {
      return new LoginResponse(null, null, "Only .edu email addresses are allowed", false);
    }

    // Check if user already exists
    if (userRepository.existsByEmail(request.getEmail())) {
      return new LoginResponse(null, null, "Email already registered", false);
    }

    // Create new user
    User user = new User();
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setVerified(false);
    user.setVerificationToken(UUID.randomUUID().toString());

    userRepository.save(user);

    // In a real app, send verification email here
    // emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());

    return new LoginResponse(null, user.getEmail(), "Registration successful. Please check your email for verification.", true);
  }

  public boolean verifyEmail(String token) {
    // Find user by verification token
    Optional<User> users = userRepository.findAll().stream()
            .filter(u -> token.equals(u.getVerificationToken()))
            .findFirst();

    if (users.isEmpty()) {
      return false;
    }

    User user = users.get();
    user.setVerified(true);
    user.setVerificationToken(null);
    userRepository.save(user);

    return true;
  }
}
