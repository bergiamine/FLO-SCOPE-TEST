JSAPI.get().registerForSearchOpen(function(formAPI, template) {
	if(!isEnvelopeTemplate(template)){
		return;
    }
	var WORKFLOW_FIELD = "workflow";
	var EENVELOPE_PREFIX = "EEnvelope_";
	var allowedWorkflows = formAPI.getAllowedValues(WORKFLOW_FIELD);
	
	var filtered = [];
	for (var i = 0; i < allowedWorkflows.length; i++) {
		var current = allowedWorkflows[i];
		if(current.getSymbolicName().indexOf(EENVELOPE_PREFIX) == 0){
        	filtered.push(current);
		}
    }
	
	formAPI.setAllowedValues(WORKFLOW_FIELD, filtered);    
});

function isEnvelopeTemplate(template){
	return template == "eEnvelopesTab" || template == "EEnvelopeSearch";
}