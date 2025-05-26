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

    public PagedResponse() {
    }

    public PagedResponse(int page, int pageSize, int totalItems, int totalPages, List<T> items) {
        this.page = page;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
        this.items = items;
    }

}
