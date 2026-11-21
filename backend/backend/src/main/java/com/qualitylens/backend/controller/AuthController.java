package com.qualitylens.backend.controller;

import com.qualitylens.backend.model.User;
import com.qualitylens.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    // SIGNUP API
    @PostMapping("/signup")
    public User signup(@RequestBody User user) {

        User savedUser = userService.registerUser(user);

        // Never return the password/hash to the frontend
        savedUser.setPassword(null);

        return savedUser;
    }

    // LOGIN API
    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {

        User loggedInUser = userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );

        // Never return the password/hash to the frontend
        loggedInUser.setPassword(null);

        return loggedInUser;
    }

    // Login request structure
    public static class LoginRequest {

        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}