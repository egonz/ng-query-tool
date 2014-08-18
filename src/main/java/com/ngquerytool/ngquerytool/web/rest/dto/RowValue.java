package com.ngquerytool.web.rest.dto;


public class RowValue {

	private Object value;
	
	private int type;
	
	public RowValue() {
		
	}
	
	public RowValue(Object value, int type) {
		this.value = value;
		this.type = type;
	}

	public Object getValue() {
		return value;
	}

	public void setValue(Object value) {
		this.value = value;
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	
	
}
