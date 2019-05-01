if(typeof(SiebelAppFacade.accelsiorGadgets) == "undefined") {
    Namespace('SiebelAppFacade.accelsiorGadgets');

    (function(){
        SiebelApp.EventManager.addListner("postload", fnAccelsiorGadgets, this);

		// The purpose of this function is to update profile attributes.
		// It needs to be updated to a method on the Accelsior Gadgets Service, where we 
		// only allow certain Profile Attributes to be set. Using the SessionAccessService is a security
		// risk as it allows any profile attribute to be set via code injection
		function fnSetPA(Name, Value) {
			try {
				let oSvc = SiebelApp.S_App.GetService("SessionAccessService");
				let psIn = SiebelApp.S_App.NewPropertySet();
				let psOut = SiebelApp.S_App.NewPropertySet();
				psIn.SetProperty("Name", Name);
				psIn.SetProperty("Value", Value);
				psOut = oSvc.InvokeMethod("SetProfileAttr", psIn);
			}
			catch (e) {
				console.log(e.toString());
			}
			finally {
				psOut = null;
				psIn = null;
				oSvc = null;
			}
		}
		
		// The purpose of this function is to update the database
		// It needs to be completely re-written to update the nodejs server
		function fnSetFaveDB(Favorites) {
			try {
				var oSvc = SiebelApp.S_App.GetService("Accelsior Gadgets Service");
				var psIn = SiebelApp.S_App.NewPropertySet();
				var psOut = SiebelApp.S_App.NewPropertySet();
				psIn.SetProperty("login", SiebelApp.S_App.GetProfileAttr("Login Name").toUpperCase());
				psIn.SetProperty("favorites", Favorites);

				if (oSvc) {
					var ai= {};
					ai.async = true;
					ai.selfbusy = true;
					ai.scope = this;
					ai.mask = true;
					ai.opdecode = true;
					ai.errcb = function(){
						//Code occurs here for the method that Siebel Open UI runs if the AJAX call fails
						console.log("Error");
						psOut = arguments[2];
						if (psOut !== null) {
							console.log(psOut.GetChild(0).GetProperty("Code"));
							console.log(psOut.GetChild(0).GetProperty("Message"));
							console.log(psOut.GetChild(0).GetProperty("Trace"));
						}
					};
					ai.cb = function(){
						//Code occurs here for the method that Siebel Open UI runs if the AJAX call is successful
					};
					oSvc.InvokeMethod("UpsertFavorites", psIn, ai);
				}
			}
			catch (e) {
				console.log(e.toString());
			}
			finally {
				ai = null;
				psIn = null;
				oSvc = null;
			}			
		}

		function fnAddTab(i, name) {
			try {
				const tabItem = $("<li>", {id: "_gfs_overlay_tab_" + name.replace(/\s/g, "_").toLowerCase(), class: "_gfs_overlay_tab"}).get(0);
				const tablink = $("<a>", {href: `#_gfs_overlay_tab_${i}`}).get(0);
				tablink.appendChild(document.createTextNode(name));
				tabItem.append(tablink);
				$("#_gfs_tabs").children("ul").append(tabItem);
				$("#_gfs_tabs").append($("<div>", {id: `_gfs_overlay_tab_${i}`}).get(0));
			}
			catch (e) {
				console.log(e);
			}
		}

		function fnAddFavorite (_id, _name, _object, _viewName, _applet) {
			try{
				const objectName = _object.replace(/[^a-z0-9]+/gi, "").toLowerCase();
				const viewName = _viewName.replace(/\s/g, "+");
				const appletName = _applet.replace(/\s/g, "+");
				const li = $("<li>", {name: _name, id: _id, class: "_gfs_fav_list_item"}).get(0);
				const div_handle = $('<div/>', {class: "_gfs_fav_list_item_handle"}).get(0);
				const div_icon = $("<div/>", {class: `_gfs_fav_list_item_${objectName}`}).get(0);
				const div_link = $("<div/>", {class: "_gfs_fav_list_item_link", v: viewName, o: objectName, a: appletName, i: _id}).get(0);
				$(div_link).unbind('click');
				$(div_link).click(() => SiebelApp.S_App.GotoView(viewName, null, `GotoView&SWEView=${viewName}&SWEApplet0=${appletName}&SWERowId0=${_id}`, null));
				div_link.appendChild(document.createTextNode(_name));
				li.appendChild(div_handle);
				li.appendChild(div_icon);
				li.appendChild(div_link);
				return li;
			}
			catch (e) {
				console.log(e);
			}
		}

		function fnAddFavoritesToOverlay(bcConfigs) {
			try {
				const favorites = SiebelApp.S_App.GetProfileAttr("gadgets_favorites");
			
				if ($("#_gfs_overlay_tab_favorites").length === 0) {
					fnAddTab(1, "Favorites");
					console.log($("#_gfs_tabs").tabs("instance"));
					$("#_gfs_tabs").tabs();
				}

				if ($("#_gfs_fav_btn_add").length === 0) {
					$("#_gfs_overlay_tab_1").prepend($("<button/>", {class:"ui-button ui-widget ui-corner-all", id:"_gfs_fav_btn_add"}).get(0));
					$("#_gfs_fav_btn_add").append(document.createTextNode("Add"));
					$('#_gfs_fav_btn_add').unbind('click');
					$("#_gfs_fav_btn_add").click(() => {
						const _bcName = SiebelApp.S_App.GetActiveBusObj().GetBCArray()[0].GetName();
						const _viewName = SiebelApp.S_App.GetActiveView().GetName();
						const _boName = SiebelApp.S_App.GetActiveBusObj().GetName() ;
						const _id = SiebelApp.S_App.GetActiveBusObj().GetBusCompByName(_bcName).GetFieldValue("Id");
						const _appletId = SiebelApp.S_App.GetActiveView().GetAppletArray()[0].parentNode.id;
						const oApplets = SiebelApp.S_App.GetActiveView().GetAppletMap();
						const bcConfig = bcConfigs.find(arr => arr.bc_name === _bcName);
						const fieldNames = bcConfig.key_fields;
						let _title = "";
						fieldNames.forEach(fieldName => {
							_title += SiebelApp.S_App.GetActiveBusObj().GetBusCompByName(_bcName).GetFieldValue(fieldName) + " ";
						})
						_title = _title.trim();

						// We have to do this loop below, because unlike the _bcname which is always array position "0"
						// the corresponding applet name can be anywhere in the oApplets object
						let _applet = "";
						for (var i in oApplets) {
							if (oApplets[i].GetFullId() === _appletId) _applet = oApplets[i].GetName();
						}
						const sFavorites = SiebelApp.S_App.GetProfileAttr("gadgets_favorites");
						let jsonFavorites = JSON.parse(sFavorites);
						const newFavorite = {i: _id, n: _title, o: _boName, v: _viewName, a: _applet};
						jsonFavorites = jsonFavorites.filter(_favorite => _favorite.i !== _id);
						$("#"+_id).remove();
						jsonFavorites.unshift(newFavorite);
					
						fnSetPA("gadgets_favorites", JSON.stringify(jsonFavorites));
						fnSetFaveDB(JSON.stringify(jsonFavorites));
						$("#_gfs_fav_list").prepend(fnAddFavorite(_id, _title, _boName, _viewName, _applet));
						$("#_gfs_fav_list").sortable('refresh');
					});
				}
				
				if (favorites.length > 0 && $("#_gfs_overlay_tab_1").has("ul").length === 0) {
					const ul = $("<ul/>", {id: "_gfs_fav_list"}).get(0);
					jsonFavorites = JSON.parse(favorites);
					jsonFavorites.forEach(favorite => ul.append(fnAddFavorite(favorite.i, favorite.n, favorite.o, favorite.v, favorite.a)));
					$("#_gfs_overlay_tab_1").append(ul);
				}
	
				$( "#_gfs_fav_list" ).sortable({
					placeholder: "ui-state-highlight",
					handle: "._gfs_fav_list_item_handle",
					stop: function(event, ui) {
						const jsonFavorites = JSON.parse(SiebelApp.S_App.GetProfileAttr("gadgets_favorites"));
						const arrFavoritesOrder = $('#_gfs_fav_list').sortable('toArray', {attribute: 'id'});
						const newJsonFavorites = [];
						arrFavoritesOrder.forEach(id => {
							newJsonFavorites.push(jsonFavorites.find(_favorite => _favorite.i === id));
						});
						fnSetPA("gadgets_favorites", JSON.stringify(newJsonFavorites));
						//fnSetFaveDB(JSON.stringify(newJsonFavorites));
					}
				});
	
				$("#_gfs_fav_list").disableSelection();
			}
			catch(e) {
				console.log(e);
			}
		}

        function fnLoadOverlay() {
			// if we're loading the overlay for the first time, add the pop-in/pop-out button
			if ($("#_gfs_button").length === 0) {
				$("#_sweview").append($("<div>", {id:"_gfs_button"}).get(0));
				$('#_gfs_button').unbind('click');
				$("#_gfs_button").click(function() {
					//console.log("Button clicked!");
					const iWidth = $("#_gfs_overlay").width();
					const sBtnCurRight = $("#_gfs_button").css("right");
					const sBtnNewRight = (sBtnCurRight == "0px") ? iWidth.toString() + "px" : "0px";
					const sHomeNewRight = (sBtnCurRight == "0px") ? "0px" : "-" + iWidth.toString() + "px";
					const sCurrentOverlayStatus = SiebelApp.S_App.GetProfileAttr("gadgets_overlay_status");
					const sNewOverlayStatus = (sCurrentOverlayStatus == "Active") ? "Inactive" : "Active";
					
					$("#_gfs_button").animate({"right": sBtnNewRight}, "fast");
					$("#_gfs_overlay").animate({"right": sHomeNewRight}, "fast");
					fnSetPA("gadgets_overlay_status", sNewOverlayStatus);
				});
        	}

			// if we're loading the overlay for the first time, now add the overlay
        	if ($("#_gfs_overlay").length === 0){
				try {
					$("#_sweview").append($("<div/>", {id:"_gfs_overlay"}).get(0));
					$("#_gfs_overlay").append($("<div/>", {id:"_gfs_tabs"}).get(0));
					$("#_gfs_tabs").append($("<ul/>").get(0));
					$("#_gfs_overlay").css("height", $("#_sweview").height());
				}
				catch (e) {
					console.log(e.toString());
				}
			}

			if (SiebelApp.S_App.GetProfileAttr("gadgets_overlay_status") === "Active") {
				$("#_gfs_button").css("right", $("#_gfs_overlay").width().toString() + "px");
				$("#_gfs_overlay").css("right", "0px");
			}
        }

		function fnAddRecentRecordsTab() {
			if ($("#_gfs_overlay_tab_recent_records").length === 0) {
				fnAddTab("2", "Recent Records");
				$("#_gfs_tabs").tabs("destroy");
				$("#_gfs_tabs").tabs();
			}
		}

        function fnAccelsiorGadgets() {
            try {
				console.log("jQuery Version: " + jQuery.fn.jquery);
				console.log("jQuery UI Version: " + $.ui.version);
				const bcConfigs = [{
					bc_name: "Contact",
					key_fields: ["First Name", "Last Name"],
					enabled: true
				},{
					bc_name: "Account",
					key_fields: ["Name"],
					enabled: true
				}];
				fnSetPA("gadgets_favorites", '[{"i":"1-AJ3J","n":"Felix Aaron","o":"Contact","v":"Visible Contact List View","a":"Contact List Applet"},{"i":"1-34Z","n":"Albany General Hospital","o":"Account","v":"All Account List View","a":"SIS Account List Applet"}]');
				fnLoadOverlay();
				fnAddFavoritesToOverlay(bcConfigs);
				//fnAddRecentRecordsTab();
            	//fnLoadProperties();
            }// end try {
            catch (error) {
                //No-Op
            }// end catch (error) {
        }// end function fnAccelsiorGadgets() {
    }());// end (function(){
}// end if (typeof (SiebelAppFacade.accelsiorGadgets) == "undefined") {