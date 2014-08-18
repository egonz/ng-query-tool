package com.ngquerytool.web.rest.dto;

import java.util.List;

public class NgQueryToolSearchResultDTO {

	private Integer page;
	
	private Integer total;
	
	private List<Row> rows;
	
	public NgQueryToolSearchResultDTO() {
		
	}

	public Integer getPage() {
		return page;
	}

	public void setPage(Integer page) {
		this.page = page;
	}

	public List<Row> getRows() {
		return rows;
	}

	public void setRows(List<Row> rows) {
		this.rows = rows;
	}

	public Integer getTotal() {
		return total;
	}

	public void setTotal(Integer total) {
		this.total = total;
	}
	
}
