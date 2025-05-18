package com.postgresql.springapi.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PagedResponse<T> {
    private int page;
    private int pageSize;
    private int totalPages;
    private long totalItems;
    private List<T> items;

}
