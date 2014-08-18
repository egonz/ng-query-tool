package com.ngquerytool.service;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;
import javax.sql.DataSource;

import org.apache.commons.lang.WordUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ngquerytool.web.rest.dto.MetaColumn;
import com.ngquerytool.web.rest.dto.MetaForeignKey;
import com.ngquerytool.web.rest.dto.MetaOperator;
import com.ngquerytool.web.rest.dto.MetaTable;
import com.ngquerytool.web.rest.dto.MetaType;
import com.ngquerytool.web.rest.dto.NgQueryToolMetaDTO;

@Service
@Transactional
public class NgQueryToolMetaService {

	private final Logger log = LoggerFactory
			.getLogger(NgQueryToolMetaService.class);

	@Inject
	private DataSource dataSource;

	public static final String DATABASE_CHANGE_LOG_TABLE = "DATABASECHANGELOG";
	public static final String DATABASE_CHANGE_LOG_LOCK_TABLE = "DATABASECHANGELOGLOCK";
	public static final String HIBERNATE_SEQUENCES_TABLE = "HIBERNATE_SEQUENCES";

	public NgQueryToolMetaDTO getMeta() {
		NgQueryToolMetaDTO meta = new NgQueryToolMetaDTO();

		Connection conn = null;

		try {
			conn = dataSource.getConnection();
			DatabaseMetaData dmd = conn.getMetaData();
			meta.setTypes(getTypes());
			meta.setTables(getTables(dmd));
		} catch (SQLException e) {
			log.error("Error getting  database metadata.", e);
		} finally {
			if (conn != null) {
				try {
					conn.close();
				} catch (SQLException e) {
					log.error("Error closing Connection.", e);
				}
			}
		}

		return meta;
	}
	
	private List<MetaType> getTypes() {
		List<MetaType> types = new ArrayList<MetaType>();
		
		types.add(new MetaType("CHAR", "SUGGEST", getStringOps()));
		types.add(new MetaType("VARCHAR", "SUGGEST", getStringOps()));
		types.add(new MetaType("NUMERIC", "TEXT", getNumberOps()));
		types.add(new MetaType("INTEGER", "TEXT", getNumberOps()));
		types.add(new MetaType("BIGINT", "TEXT", getNumberOps()));
		types.add(new MetaType("DECIMAL", "TEXT", getNumberOps()));
		types.add(new MetaType("SMALLINT", "TEXT", getNumberOps()));
		types.add(new MetaType("BOOLEAN", "SELECT", getBooleanOps()));
		types.add(new MetaType("DATE", "DATE", getDateOps()));
		types.add(new MetaType("TIMESTAMP", "DATE", getDateOps()));
		
		return types;
	}
	
	private List<MetaOperator> getStringOps() {
		List<MetaOperator> ops = new ArrayList<MetaOperator>();
		
		ops.add(new MetaOperator("=", "is"));
		ops.add(new MetaOperator("<>", "is not"));
		ops.add(new MetaOperator("LIKE", "like"));
		ops.add(new MetaOperator("<", "less than"));
		ops.add(new MetaOperator(">", "greater than"));
		
		return ops;
	}
	
	private List<MetaOperator> getNumberOps() {
		List<MetaOperator> ops = new ArrayList<MetaOperator>();
		
		ops.add(new MetaOperator("=", "is"));
		ops.add(new MetaOperator("<>", "is not"));
		ops.add(new MetaOperator("<", "less than"));
		ops.add(new MetaOperator(">", "greater than"));
		
		return ops;
	}
	
	private List<MetaOperator> getBooleanOps() {
		List<MetaOperator> ops = new ArrayList<MetaOperator>();
		
		ops.add(new MetaOperator("=", "is"));
		
		return ops;
	}
	
	private List<MetaOperator> getDateOps() {
		List<MetaOperator> ops = new ArrayList<MetaOperator>();
		
		ops.add(new MetaOperator("=", "is"));
		ops.add(new MetaOperator("<>", "is not"));
		ops.add(new MetaOperator("<", "before"));
		ops.add(new MetaOperator(">", "after"));
		
		return ops;
	}

	private List<MetaTable> getTables(DatabaseMetaData dmd)
			throws SQLException {
		List<MetaTable> tables = new ArrayList<MetaTable>();

		ResultSet rs = dmd
				.getTables(null, null, null, new String[] { "TABLE" });

		while (rs.next()) {
			String tableName = rs.getString("TABLE_NAME");

			if (!tableName.equals(DATABASE_CHANGE_LOG_TABLE)
					&& !tableName.equals(DATABASE_CHANGE_LOG_LOCK_TABLE)
					&& !tableName.equals(HIBERNATE_SEQUENCES_TABLE)) {

				MetaTable table = new MetaTable();
				table.setName(tableName);
				table.setLabel(WordUtils.capitalize(tableName));
				table.setColumns(getColumns(tableName, dmd));
				table.setFks(getForeignKeys(tableName, dmd));
				tables.add(table);
			}
		}

		return tables;
	}

	private List<MetaColumn> getColumns(String tableName,
			DatabaseMetaData dmd) throws SQLException {
		List<MetaColumn> cols = new ArrayList<MetaColumn>();
		ResultSet rsCols = dmd.getColumns(null, null, tableName, null);

		while (rsCols.next()) {
			String columnName = rsCols.getString("COLUMN_NAME");
			String type = rsCols.getString("TYPE_NAME");
			if ("ISOFFICIAL".equals(columnName)) {
				type = "BOOLEAN";
			}

			MetaColumn col = new MetaColumn(
					columnName, columnName, type, rsCols.getInt("COLUMN_SIZE"));
			cols.add(col);
		}

		return cols;
	}

	private List<MetaForeignKey> getForeignKeys(
			String tableName, DatabaseMetaData dmd) throws SQLException {

		List<MetaForeignKey> fks = new ArrayList<MetaForeignKey>();
		ResultSet rs2 = dmd.getExportedKeys(null, null, tableName);

		while (rs2.next()) {
			MetaForeignKey fk = new MetaForeignKey();
			
			int keySeq = rs2.getInt("KEY_SEQ");

			if (keySeq == 1) {
				fk.setName(rs2.getString("FK_NAME"));
				 String key = "fk." + fk.getName();
				 fk.setLabel(key);
				 fk.setReverseLabel(key);
				 fk.setFkTableName(rs2.getString("FKTABLE_NAME"));
			}
			
			fk.setFkColumnNames(rs2.getString("FKCOLUMN_NAME"));
			fk.setPkColumnNames(rs2.getString("PKCOLUMN_NAME"));
			
			fks.add(fk);
		}

		return fks;
	}

}
