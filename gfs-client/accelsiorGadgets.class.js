class AccelsioGadgetsLoader {
    constructor() {
        console.log('AccelsioGadgetsLoader object successfully instantiated...');
    }
    fnSetPA(Name, Value) {
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

    fnLoadOverlay() {
        // if we're loading the overlay for the first time, add the pop-in/pop-out button
        if ($("#_gfs_overlay").length === 0) {
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
    }
}