//Global variable
customerReferential = new Array();

JSAPI.get().registerForComponentChange(function(formAPI, component, phase) {
	processCustomerReference(formAPI, component, phase);
});

JSAPI.get().registerForSearchOpen(function(api, template){
	if(api.hasField("RefClient")){
		initSuggestions(api, false);
	}
});

function processCustomerReference(formAPI, component, phase){
	if(formAPI.hasField("RefClient")){
		initSuggestions(formAPI, true);
	}
}

function initSuggestions(formAPI, indexation){
	var request = buildCustomerReferencesRequest();
	JSAPI.get().getComponentSearchAPI().searchComponent("VIRTUAL_FOLDER", request, function(customerFolders){
		var references = getRefCustomerSuggestions(customerFolders);
		if(indexation){
			bindOnReferenceChanges(formAPI);
		}
		console.log(customerFolders.length + " DossierClient found");
		formAPI.setAllowedValues("RefClient",references); 
	});
}

function bindOnReferenceChanges(formAPI){
	formAPI.registerForFieldChange("RefClient", function(fieldName, reference) {
		onReferenceChanged(formAPI, reference);
    });
}

function onReferenceChanged(formAPI, reference) {
	hasFilledValues = formAPI.getValue("PrenomClient") != "" && formAPI.getValue("NomClient") != "";
	var json = customerReferential[reference];
	if(json != undefined){
		formAPI.setValue("PrenomClient", json.PrenomClient);
		formAPI.setValue("NomClient", json.NomClient);
		formAPI.setReadOnly("PrenomClient", true);
		formAPI.setReadOnly("NomClient", true);
	}
	else if(hasFilledValues){
		//Clear values if was previously filled
		formAPI.setValue("PrenomClient", "");
		formAPI.setValue("NomClient", "");
		if(formAPI.getComponent().getId() == undefined){
			formAPI.setReadOnly("PrenomClient", false);
			formAPI.setReadOnly("NomClient", false);
		}
	}
}

function getRefCustomerSuggestions(customerFolders){
	var suggestions = [];
	for (var i = 0; i < customerFolders.length; i++)
	{
		var customerFolder = customerFolders[i];
		var reference = customerFolder.getFieldValue("RefClient");
		var nom = customerFolder.getFieldValue("NomClient");
		var prenom = customerFolder.getFieldValue("PrenomClient");	
		var suggestion = buildAllowedValues(reference, prenom+" "+nom+"("+reference+")");
		suggestions.push(suggestion);
		addValueToReferential(reference,customerFolder);
	}
	return suggestions;
}

function addValueToReferential(key,result){
	var customer = {};
	customer.PrenomClient = result.getFieldValue("PrenomClient");
	customer.NomClient = result.getFieldValue("NomClient");
	customerReferential[key] = customer;
}


function buildCustomerReferencesRequest(){
	var request = new SearchRequest();
	request.setMax(50);
	request.setStart(0);

	request.addSelect("RefClient");
	request.addSelect("PrenomClient");
	request.addSelect("NomClient");

	var filters = new AndClause();
	request.addFilterClause(filters);

	var classCriterion = new Criterion();
	classCriterion.setName("classid");
	classCriterion.setOperator("EQUALS_TO");
	classCriterion.addValue("DossierClient");
	filters.addCriterion(classCriterion);
	
	return request;
}

function buildAllowedValues(name, displayName){
	var allowedValue = new AllowedValueDefinition();
	allowedValue.setSymbolicName(name);

	var displayNames = new I18NLabel()
	displayNames.setLabel(new Language("EN"), displayName);
	allowedValue.setDisplayNames(displayNames);
	return allowedValue;
}