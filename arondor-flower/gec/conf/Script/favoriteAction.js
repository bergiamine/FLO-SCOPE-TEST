JSAPI.get().registerForComponentChange(function(componentFormAPI, component, phase) {
	console.log("component has change " + component.getCategory());

	if (phase == "MODIFY" && component.getCategory() == "TASK" && component.getWorkflow() != undefined) {
		displayFavoriteAction(componentFormAPI, component, phase);
	}
});

function displayFavoriteAction(api, component, phase){
	var action = new FavoriteComponentAction(component.getCategory(), component.getId());
	api.getActions().getHeaderActions().add(action);
}