class AccelsioGadgetsLoader {
    constructor() {
        console.log('AccelsioGadgetsLoader object successfully instantiated...');
    }

    fnAddTab(i, name) {
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

    fnAddFavorite (_id, _name, _object, _viewName, _applet) {
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

    fnLoadOverlay() {
        // if we're loading the overlay for the first time, add the pop-in/pop-out button
        if ($("#_gfs_overlay").length === 0) {
            $("#_sweview").append($("<div>", {id:"_gfs_button"}).get(0));
            $('#_gfs_button').unbind('click');
            $("#_gfs_button").click(() => {
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
            $("#_sweview").append($("<div/>", {id:"_gfs_overlay"}).get(0));
			$("#_gfs_overlay").append($("<div/>", {id:"_gfs_tabs"}).get(0));
			$("#_gfs_tabs").append($("<ul/>").get(0));
			fnSetOverlayHeight();
        }
    }
}

function fnSetOverlayHeight() {
    $("#_gfs_overlay").css("height", $("#_sweview").height());
}

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
        console.log(e);
    }
    finally {
        psOut = null;
        psIn = null;
        oSvc = null;
    }
}
