NG-Query-Tool 
=============

AngularJS SQL Query Tool. Utilizing [Red Query Builder](http://redquerybuilder.appspot.com/), [AngularUI Bootstrap](http://angular-ui.github.io/bootstrap/), [NG-Table](https://github.com/esvit/ng-table), and [Angular-xeditable](http://vitalets.github.io/angular-xeditable/).

Install
-------

Bower install:

	bower install ng-query-tool --save

Include Javascript library and dependencies:

	<script src="bower_components/angular-bootstrap/ui-bootstrap.min.js"></script>
	<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>
	<script src="bower_components/ng-table/ng-table.min.js"></script>
	<script src="bower_components/ng-table-export/ng-table-export.src.js"></script>
	<script src="bower_components/angular-xeditable/dist/js/xeditable.min.js"></script>
	<script src="bower_components/ng-query-tool/scripts/ng-query-tool.js"></script>

Add Angular module:

	angular.module('myApp',['ngQueryTool']);

Include the angular directive tag in a view:

	<ng-query-tool></ng-query-tool>

Done.


Create REST services. Or if your backend is Java based, perhaps built with JHipster, skip this step and use the included Java classes. See the section below.

Meta API

		/app/rest/ngquerytool/meta

	Output:

		{  
		   "types":[  
		      {  
		         "name":"CHAR",
		         "editor":"SUGGEST",
		         "operators":[  
		            {  
		               "name":"=",
		               "label":"is",
		               "cardinality":"ONE"
		            },
		            {  
		               "name":"<>",
		               "label":"is not",
		               "cardinality":"ONE"
		            }

		            etc...
		         ]
		      }

		      etc...
		   ],
		   "tables":[  
		      {  
		         "name":"T_USER",
		         "label":"T_USER",
		         "columns":[  
		            {  
		               "name":"LOGIN",
		               "label":"LOGIN",
		               "type":"VARCHAR",
		               "size":50
		            },
		            {  
		               "name":"PASSWORD",
		               "label":"PASSWORD",
		               "type":"VARCHAR",
		               "size":100
		            }

		            etc...
		       
		         ],
		         "fks":[  
		            {  
		               "name":"FK_USER_PERSISTENT_TOKEN",
		               "label":"fk.FK_USER_PERSISTENT_TOKEN",
		               "reverseLabel":"fk.FK_USER_PERSISTENT_TOKEN",
		               "fkTableName":"T_PERSISTENT_TOKEN",
		               "pkColumnNames":"LOGIN",
		               "fkColumnNames":"USER_LOGIN"
		            }

		            etc...
		         ]
		      }
		   ]
		}

Search API


		/app/rest/ngquerytool/search?sql=select%20*%20from%20t_user&bindVars[]=&page=0&rp=10


	Output:

		{  
		   "page":1,
		   "total":4,
		   "rows":[  
		      {  
		         "LOGIN":"shabadoo",
		         "FIRST_NAME":"Joey Joe Joe Jr",
		         "LAST_NAME":"Shabadoo",
		         "EMAIL":"jshabadoo@gmail.com"
		         "CREATED_BY":"user",
		         "CREATED_DATE":"2014-08-15 19:52:24.776",
		         "LAST_MODIFIED_BY":"null",
		         "LAST_MODIFIED_DATE":"null"
		      }
		   ]
		} 

	See the included json examples for a complete reference.

Java Install (optional)
-----------------------

Add jackson to your project dependencies:

	<dependency>
		<groupId>com.fasterxml.jackson.datatype</groupId>
		<artifactId>jackson-datatype-json-org</artifactId>
		<version>${jackson.version}</version>
	</dependency>

From inside your webapp project directory, copy the ng-query-tool Java classes into your src dir:
	
	cp -r ng-query-tool/src/ src/

Add the package to your Spring configurtion:

	@ComponentScan({"com.myapp","com.ngquerytool"})


License
-------

The MIT License (MIT)
[OSI Approved License]
The MIT License (MIT)

Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


