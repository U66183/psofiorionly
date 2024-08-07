/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/pso/customerrecord/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.pso.customerrecord.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                //jQuery.sap.require("com.pso.customerrecord.formatter.Formatter");

                //This is used for Search Customer
                var oSearchCustomerJModel = new sap.ui.model.json.JSONModel();
                    this.setModel(oSearchCustomerJModel, "oSearchCustomerJModel");
                
                    //This is used for all dropdown
                var dropDownJsonModel= new sap.ui.model.json.JSONModel();
                    this.setModel(dropDownJsonModel,"dropDownJsonModel");

                //This is used for substation f4 help
                    var oSubstationJModel= new sap.ui.model.json.JSONModel();
                    this.setModel(oSubstationJModel,"oSubstationJModel");
                
                    //This is uesd for Circuit F4 Help
                var oCircuitJModel= new sap.ui.model.json.JSONModel();
                    this.setModel(oCircuitJModel,"oCircuitJModel");
                
                    //This is used for all customer attributes
                var oCustomerAttributesJModel= new sap.ui.model.json.JSONModel(); 
                    this.setModel(oCustomerAttributesJModel,"oCustomerAttributesJModel"); 

                // var oCreateChildFlockJModel_DD= new sap.ui.model.json.JSONModel();
                //     this.setModel(oCreateChildFlockJModel_DD,"oCreateChildFlockJModel_DD");
                   
                // var oCustomerAttrubuteJModel= new sap.ui.model.json.JSONModel();
                //     this.setModel(oCustomerAttrubuteJModel,"oCustomerAttrubuteJModel");
            }
        });
    }
);