package com.postgresql.springapi.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class ApiResponse<T> {
    private String code;
    private String message;
    private T data;

    public ApiResponse(String code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

}
