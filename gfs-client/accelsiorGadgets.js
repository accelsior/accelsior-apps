if(typeof(SiebelAppFacade.accelsiorGadgets) == "undefined") {
    Namespace('SiebelAppFacade.accelsiorGadgets');

    (function(){
        SiebelApp.EventManager.addListner("postload", fnAccelsiorGadgets, this);
		console.log(jQuery.fn.jquery);
		console.log($.ui ? $.ui.version || "pre 1.6" : 'jQuery-UI not detected');
		//const filePath = 'https://cdn.jsdelivr.net/gh/accelsior/accelsior-apps@1.0/gfs-client/accelsiorGadgets.class.js'
		const filePath = './scripts/siebel/custom/accelsiorGadgets.class.js'
			if ($(`head script[src='${filePath}']`).length > 0) {
				console.log('js file exists');
			} else {
				$('head').append($('<script/>', {type: 'text/javascript', src: filePath}).get(0));
			}
		//fnSetPA("gadgets_favorites", '[{"i":"1-AJ3J","n":"Felix Aaron","o":"Contact","v":"Visible Contact List View","a":"Contact List Applet"},{"i":"1-34Z","n":"Albany General Hospital","o":"Account","v":"All Account List View","a":"SIS Account List Applet"}]');
		//fnSetPA("gadgets_config", '[{"bc_name":"Contact","key_fields":["First Name","Last Name"],"enabled":"true"},{"bc_name":"Account","key_fields":["Name"],"enabled":"true"}]');
		const accelsiorGadgets = new AccelsioGadgetsLoader();
		accelsiorGadgets.fnLoadOverlay();            

        function fnAccelsiorGadgets() {
            try {
				//const jsonFavorites = JSON.parse(SiebelApp.S_App.GetProfileAttr("gadgets_favorites"));
				//const jsonConfig = JSON.parse(SiebelApp.S_App.GetProfileAttr("gadgets_config"));
				//console.log(jsonFavorites);
				//console.log(jsonConfig);
				//fnLoadProperties();
            	}// end try {
            catch (e) {
                console.log(e)
            }// end catch (error) {
        }// end function fnAccelsiorGadgets() {
    }());// end (function(){
}// end if (typeof (SiebelAppFacade.accelsiorGadgets) == "undefined") {