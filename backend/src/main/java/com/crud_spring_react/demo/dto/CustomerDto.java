package com.crud_spring_react.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public class CustomerDto {

    private Long id;

    @NotBlank(message = "fullName est obligatoire")
    @Size(min = 2, max = 120, message = "fullName doit être entre 2 et 120 caractères")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÿ' -]+$",
            message = "fullName ne doit contenir que des lettres, espaces, tirets ou apostrophes"
    )
    private String fullName;

    @NotBlank(message = "email est obligatoire")
    @Size(max = 180, message = "email ne doit pas dépasser 180 caractères")
    @Email(message = "email invalide")
    @Pattern(
            regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message = "email doit contenir un domaine valide (ex: nom@domaine.com)"
    )
    private String email;

    public CustomerDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}