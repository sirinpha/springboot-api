package com.postgresql.springapi.dto;

import java.util.List;

import lombok.Data;

@Data
public class PagedResponse<T> {
    private int page;
    private int pageSize;
    private int totalPages;
    private long totalItems;
    private List<T> items;

}
