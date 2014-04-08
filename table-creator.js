var row = '';
var ind = '';
var frn = '';
var trigger_declare = '';
var trigger_begin = '';
row += '<tr>\n';
row += '	<td><input type="text" class="field-name" name="field-name" /></td>\n';
row += '	<td>\n';
row += '		<select id="field-type" name="field-type">\n';
row += '			<option value="varchar2">varchar2</option>\n';
row += '			<option value="number">number</option>\n';
row += '			<option value="date">date</option>\n';
row += '			<option value="nvarchar2">nvarchar2</option>\n';
row += '			<option value="char">char</option>\n';
row += '			<option value="varchar">varchar</option>\n';
row += '			<option value="nvarchar">nvarchar</option>\n';
row += '			<option value="nchar">nchar</option>\n';
row += '			<option value="long">long</option>\n';
row += '			<option value="binary_float">binary_float</option>\n';
row += '			<option value="binary_double">binary_double</option>\n';
row += '			<option value="nchar">nchar</option>\n';
row += '			<option value="blob">blob</option>\n';
row += '			<option value="clob">clob</option>\n';
row += '			<option value="nclob">nclob</option>\n';
row += '			<option value="bfile">bfile</option>\n';
row += '			<option value="rowid">rowid</option>\n';
row += '			<option value="urowid">urowid</option>\n';
row += '		</select>\n';
row += '	</td>\n';
row += '	<td><input type="text" id="parameter" name="parameter" /></td>\n';
row += '	<td><input type="text" id="default-value" name="default-value" /></td>\n';
row += '	<td><input type="checkbox" id="not-null" name="not-null" /></td>\n';
row += '</tr>\n';

ind += '<tr>\n';
ind += '	<td><input type="checkbox" id="unique" name="unique" /></td>\n';
ind += '	<td><input type="text" id="fields" name="fields" class="fields" /></td>\n';
ind += '	<td><input type="text" id="index-name" name="index-name" class="index-name" /></td>\n';
ind += '</tr>\n';

frn += '<tr>\n';
frn += '	<td><input type="text" class="fk-fields" name="fk-fields" /></td>\n';
frn += '	<td><input type="text" class="fk-table" name="fk-table" /></td>\n';
frn += '	<td><input type="text" class="fk-table-field" name="fk-table-field" /></td>\n';
frn += '</tr>\n';


$(document).on("change", ".field-name", function() {
	cnt = $(".field-name").length;
	val = $(this).val();

	if ((val == "") && (cnt > 0)) {
		$(this).parent("td").parent("tr").html("")
	} else if (val != "") {
		$("#table-content").append(row);	
	}
}).on("change", "#fields", function() {
	cnt = $("#fields").length;
	val = $(this).val();

	if ((val == "") && (cnt > 0)) {
		$(this).parent("td").parent("tr").html("");
	} else if (val != "") {
		$(".index-name").last().val($("#table-name").val() + "_nx" + $(".index-name").length);
		$("#index-content").append(ind);
	}	
}).on("change", ".fk-fields", function() {
	cnt = $(".fk-fields").length;
	val = $(this).val();

	if ((val == "") && (cnt > 0)) {
		$(this).parent("td").parent("tr").html("")
	} else if (val != "") {
		$("#foreign-content").append(frn);
	}	
}).on("submit", "#frm-create", function(event) {
	event.preventDefault();
	generateSql();
}).ready(function() {
	$("#table-content").append(row);
	$("#index-content").append(ind);
	$("#foreign-content").append(frn);
});


function generateSql() {
	var sql = "";
	var table_name = $("#table-name").val();
	var create_history = $("#create-history:checked").length > 0;
	var synonym = $("#synonym:checked").length > 0;
	var grant = $(".grant:checked").length > 0;
	var autonumber_field = $("#autonumber-field").val();
	var pk_field = $("#pk-field").val();
	
	row = '';
	ind = '';
	frn = '';
	trigger_declare = '';
	trigger_begin = '';

	sql += "create table " + table_name + "(\n";

	if ($("#autonumber-field").val() != "") {
		sql += "\t" + $("#autonumber-field").val() + " number(11),\n";
	}
	
	len = $(".field-name").length;

	$(".field-name").each(function(index, element) {
		field_name = $(this).val();
		if (field_name != "") {
			field_type = $(this).parent("td").parent("tr").find("#field-type").val();
			parameter = $(this).parent("td").parent("tr").find("#parameter").val();
			default_value = $(this).parent("td").parent("tr").find("#default-value").val();
			not_null = $(this).parent("td").parent("tr").find("#not-null:checked").length > 0;

			sql += "\t" + field_name + " " + field_type;
			
			if (parameter != "") 
				sql += "(" + parameter + ")";

			if (default_value != "")
				sql += " default " + default_value;
		}
		if ((index != len - 1) & (field_name != "")) {
			sql += ",";
		} else {
			if (create_history) {
				sql += "\tcreated_by varchar2(30) default user,\n"
				sql += "\tupdated_by varchar2(30),\n"
				sql += "\tcreate_date date default sysdate,\n"
				sql += "\tupdate_date date"
			}
		}
		sql += "\n";
	});

	sql += ");\n\n";

	if (synonym) {
		sql += "create public synonym " + table_name + " for " + table_name + ";\n\n";
	}

	if (grant) {
		sql += "grant";
		if ($("#delete:checked").length > 0) sql += " delete,";
		if ($("#insert:checked").length > 0) sql += " insert,";
		if ($("#references:checked").length > 0) sql += " references,";
		if ($("#select:checked").length > 0) sql += " select,";
		if ($("#update:checked").length > 0) sql += " update,";

		sql = sql.substring(0, sql.length - 1) + " on " + table_name + " to public;\n\n";
	}

	$(".fields").each(function() {
		ifield = $(this).val();

		if (ifield != '') {
			iunique = $(this).parent("td").parent("tr").find("#unique:checked").length > 0;
			iindex_name = $(this).parent("td").parent("tr").find("#index-name").val();

			if (iunique) {
				sql += "create unique index " + iindex_name + " on " + table_name + "(" + ifield + ");\n\n ";
			} else {
				sql += "create index " + iindex_name + " on " + table_name + "(" + ifield + ");\n\n";
			}
		}
	});
	
	fk_cnt = 0;
	$(".fk-fields").each(function() {
		fk_cnt += 1;
		fk_field = $(this).val();
		fk_table = $(this).parent("td").parent("tr").find(".fk-table").val();
		fk_table_field = $(this).parent("td").parent("tr").find(".fk-table-field").val();
		
		if (fk_field != "") {
			sql += "\nalter table " + table_name + " add constraint fk_" + table_name + "_" + fk_cnt + " ";
			sql += "foreign key(" + fk_field + ") "
			sql += "references " + fk_table + "(" + fk_table_field + ");\n";
		}			
	});

	if (pk_field != "") {
		sql += "alter table " + table_name + " add constraint " + table_name + "_pk primary key (" + pk_field + ");\n"
	}
	
	if (autonumber_field != "") {
		seq_name = table_name + "_seq";
		sql += "\n\ncreate sequence " + seq_name + ";\n";
		
		if (synonym) {
			sql += "\ncreate public synonym " +  seq_name + " for " + seq_name + ";\n";
		}
		
		if (grant) {
			sql += "\ngrant select on " + seq_name + " to avalon;\n";
		}
		
		trigger_declare += "recno number;\n";
		trigger_begin += "if inserting then\n";
		trigger_begin += "\tselect " + seq_name + ".nextval into recno from dual;\n";
		trigger_begin += "\t:new." + autonumber_field + " := recno;\n";
		trigger_begin += "end if;\n";
	}
	
	if (create_history) {
		trigger_begin += "\t:new.updated_by := user;\n";
		trigger_begin += "\t:new.update_date := sysdate;\n";
	}

	if (trigger_begin != "") {
		sql += "\n\ncreate trigger avlown." + table_name + "_pre before insert or update on avlown." + table_name + " referencing new as new old as old for each row\n";
		
		if (trigger_declare != "") 
			sql += "declare\n" + trigger_declare + "\n";
			
		sql += "begin\n";
		sql += trigger_begin;
		sql += "end;\n";
	}
	
	bootbox.alert("<textarea style='width: 100%; height: 500px'>" + sql + "</textarea>");
}
