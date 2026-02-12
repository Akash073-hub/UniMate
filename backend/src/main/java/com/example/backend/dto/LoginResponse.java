package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
  private String token;
  private String email;
  private String FirstName;
  private String LastName;
  private String message;
  private boolean success;


  public LoginResponse(String message) {
    this.message = message;
  }

  public LoginResponse(String FirstName,String LastName,String message,boolean success) {
  }
}
