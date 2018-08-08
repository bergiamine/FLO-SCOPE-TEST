var cardAPI = JSAPI.get().getCardAPI();
cardAPI.registerForAttachment(function(card, task, definition, component){
	var api = JSAPI.get().getLastComponentFormAPI();
	var component = api.getComponent();
	if(component.getClassId() == "GEC_Step2_ATraiter" && definition.getId() == "Reponse" && component.getAssignee() == JSAPI.get().getUserAPI().getId()){
		addGenerateFromModelAction(api, card);
	}
});

function addGenerateFromModelAction(formAPI, card){
	var actionAPI = JSAPI.get().getActionFactoryAPI();
	var action = actionAPI.buildIcon("Générer à partir d'un modèle", "fa-image", function(actionPresenter){
		launch(formAPI);
    });   
    card.getActions().add(action);
}


function launch(api){
	var modelId = "model-reponse";
	var user = JSAPI.get().getUserAPI().getDisplayName();
	generate(modelId, "["+asJSONTag(api, "PrenomClient")+","+asJSONTag(api, "NomClient")+","+asJSONTag(api, "RefClient", "Christoto")+","+asJSONTag(api, "ObjetCourrier", "Christoto")+","+JSON.stringify(generateTag("CurrentUser", user)) +"]");	
}

function generate(modelId, data){
	var url = "./plugins/documentGenerator/model/"+modelId;
	var params ={};
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function () {
		if (this.status === 200) {
			var filename = "";
			var disposition = xhr.getResponseHeader('Content-Disposition');
			if (disposition && disposition.indexOf('attachment') !== -1) {
				var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				var matches = filenameRegex.exec(disposition);
				if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
			}
			var type = xhr.getResponseHeader('Content-Type');

			var blob = typeof File === 'function'
				? new File([this.response], filename, { type: type })
				: new Blob([this.response], { type: type });
			if (typeof window.navigator.msSaveBlob !== 'undefined') {
				// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
				window.navigator.msSaveBlob(blob, filename);
			} else {
				var URL = window.URL || window.webkitURL;
				var downloadUrl = URL.createObjectURL(blob);

				if (filename) {
					// use HTML5 a[download] attribute to specify filename
					var a = document.createElement("a");
					// safari doesn't support this yet
					if (typeof a.download === 'undefined') {
						window.location = downloadUrl;
					} else {
						a.href = downloadUrl;
						a.download = filename;
						document.body.appendChild(a);
						a.click();
					}
				} else {
					window.location = downloadUrl;
				}

				setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
			}
		}
	};
	xhr.setRequestHeader('Content-type', "application/json; charset=utf-8");
	xhr.send(data);
}

function asJSONTag(api, name){
	return JSON.stringify(generateTag(name, api.getValue(name)));
}

function generateTag(name, value){
	var r = new Array();
	r[0] = value;
	return  { "name": name, "value": r };
}
