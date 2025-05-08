sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "sap/m/ToolbarSpacer",
    "sap/ui/core/format/DateFormat"
], (Controller, ODataModel, Filter, FilterOperator, JSONModel, MessageBox, ToolbarSpacer, DateFormat) => {
    "use strict";

    return Controller.extend("com.sap.lh.mr.zcurrentvalidation.controller.Main", {
        onInit() {
            const oView = this.getView();
            oView.setModel(new JSONModel({
				rowMode: "Fixed"
			}), "ui");

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/RowModes"));
			}, function(oError) { /*ignore*/ });
        },
        onSearch: function () {
            const oView = this.getView();
            var Ams = this.getView().byId("idAms").getValue();
            var Equipment = this.getView().byId("idEquipment").getValue();
            if (Ams === "" && Equipment === "") {
                return MessageBox.error("Either AMS or Equipment are required...");
            }
            else if (Ams !== "" && Equipment !== "") {
                return MessageBox.error("Only enter Either AMS or Equipment not both...");
            }

            var periodFrom = this.getView().byId("idDTP1").getValue();

            var periodTo = this.getView().byId("idDTP2").getValue();
            if (periodFrom === "" || periodTo === "") {
                return MessageBox.error("Period From and Period To are mandatatory...");
            }
            var fromDate = this.getDateFormat(this.byId("idDTP1").getDateValue());
            var toDate = this.getDateFormat(this.byId("idDTP2").getDateValue());

            var aFilter = [];
            if (Ams !== "") {
                aFilter.push(new Filter("AMS", FilterOperator.EQ, Ams));
            } else if (Equipment !== "") {
                aFilter.push(new Filter("Equipment", FilterOperator.EQ, Equipment));
            }

            aFilter.push(new Filter("Date", FilterOperator.BT, fromDate, toDate));
            var oModel = this.getOwnerComponent().getModel();
            var oJsonModel = new sap.ui.model.json.JSONModel();
            var oBusyDialog = new sap.m.BusyDialog({
                title: "Loading Data",
                text: "Please wait..."
            });
            oBusyDialog.open();
            oModel.read("/OutputSet", {
                filters: aFilter,
                success: function (response) {
                    oBusyDialog.close();
                    oJsonModel.setData(response.results);
                    oView.byId("idTableCurrVal").setModel(oJsonModel, "CurrentValidationModel");
                },
                error: (oError) => {
                    oBusyDialog.close();
                    console.error("Error:", oError);
                }
            });
        },
        getDateFormat: function (strDate) {
            var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-ddTHH:mm:ss" });
            var formatDate = oDateFormat.format(strDate);
            return formatDate;
            //return "datetime" + formatDate ;
        }
    });
});