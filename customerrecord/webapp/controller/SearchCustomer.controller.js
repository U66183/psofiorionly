sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/pso/customerrecord/js/Formatter",
    "sap/ui/model/odata/ODataModel",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/type/String',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/SearchField',
    'sap/m/Token',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ushell/ui5service/ShellUIService",
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/export/Spreadsheet"
],
    function (Controller, Formatter, ODataModel, JSONModel, String, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator, ShellUIService, PersonalizableInfo, Spreadsheet) {
        "use strict";

        return Controller.extend("com.pso.customerrecord.controller.SearchCustomer", {
            onInit: function () {
                this.getUserScope();
                this.oDataModel = this.getOwnerComponent().getModel(); //make the change
                this.oView = this.getView();
                this.onActivatingStandardFilter(); //Activating standard filters
                this.onLetsDoBusy();
                this.fetchDropdownData();
            },
           
            //******************Activating Standard and customize filter option************/
            onActivatingStandardFilter: function () {
                this.applyData = this.applyData.bind(this);
                this.fetchData = this.fetchData.bind(this);
                this.oSmartVariantManagement = this.getView().byId("svm");
                this.oFilterBar = this.getView().byId("_IDGenFilterBar1");
                this.getFiltersWithValues = this.getFiltersWithValues.bind(this);
                this.oFilterBar.registerFetchData(this.fetchData);
                this.oFilterBar.registerApplyData(this.applyData);
                this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);
                var oPersInfo = new PersonalizableInfo({
                    type: "filterBar",
                    keyName: "persistencyKey",
                    dataSource: "",
                    control: this.oFilterBar
                });
                this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
                this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);
            },

            //Setting selectd value in filters
            applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setValue(oDataObject.fieldData);
                }, this);
            },

            fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getValue()
                    });

                    return aResult;
                }, []);

                return aData;
            },

            getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();

                    if (oControl && oControl.getValue && oControl.getValue().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }

                    return aResult;
                }, []);

                return aFiltersWithValue;
            },
            //********************************End*********************************/

            //*****************************Fatching data with basic code********************************** */
            // onchange:function(){
            //  this.oSmartVariantManagement.currentVariantSetModified(true);
            //  this.oFilterBar.fireFilterChange(oEvent);
            // },

            // fetchItems2:function(){
            //  var City = this.getView().byId("idcity").getValue();
            //  var CustName = this.getView().byId("idcustomer").getValue();
            //  var MailingName = this.getView().byId("idMailingname").getValue();
            //  var streetAdd = this.getView().byId("idStreetAdd").getValue();
            //  var streetNo = this.getView().byId("idStreetNo").getValue();
            //  var zipcode = this.getView().byId("idzipcode").getValue();
            //     var oSearchCustomerJModel = this.oView.getModel("oSearchCustomerJModel");
            //     var oPromiseModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZPSO_CHLD_CO_CRE_UPD_SRV");
            //     oPromiseModel.read("Customer_searchSet?$filter=cust_name eq '"+CustName+"' and city eq '"+City+"' and mail_name eq '"+MailingName+"' and street_name eq '"+streetAdd+"' and street_no eq '"+streetNo+"' and zip_code eq '"+zipcode+"'", {
            //         success: function (oData) {
            //             oSearchCustomerJModel.setData(oData.results);

            //         },
            //         error: function (error) {
            //             sap.m.MessageBox.show(
            //                 error.message, {
            //                     icon: sap.m.MessageBox.Icon.ERROR,
            //                     title: "Error",
            //                     actions: [sap.m.MessageBox.Action.OK]
            //                 });

            //         }
            //     });
            // },

            //**********************Initiating Busy Indicator***********************************/
            onLetsDoBusy: function () {
                this.oBusyIndicator = 0;
                this.oBusyIndicator = (this.oBusyIndicator) ? this.oBusyIndicator
                    : new sap.m.BusyDialog({
                        text: '',
                        title: "Fetching data..."
                    });
                return this.oBusyIndicator;
            },
            //********************************End*********************************/

            //***************************Fatching Dropdowns Values*************************/
            fetchDropdownData: function () {
                var that = this;
                var dropDownJsonModel = this.getOwnerComponent().getModel("dropDownJsonModel");;
                this.oBusyIndicator.open();
                this.getOwnerComponent().getModel().read("/DropdownSet", {
                    success: function (oData) {
                        that.oBusyIndicator.close()
                        if (oData.results.length > 0) {
                            dropDownJsonModel.setProperty("/DropdownData", oData.results)
                        }
                    }, 
                    error: function (error) {
                        that.oBusyIndicator.close();
                        sap.m.MessageBox.show(
                            error.message, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        dropDownJsonModel.setData(oData.results);
                    }
                });
            },
            //********************************End*********************************/

            //*************************Fatching Customer Records****************************/  
            fetchItems: function () {
                var that = this;
                var oSearchCustomerJModel = this.oView.getModel("oSearchCustomerJModel");
                var sCustName = this.oView.byId("idcustomer").getValue();
                var sMailingName = this.oView.byId("idMailingname").getValue();
                var sStreetAdd = this.oView.byId("idStreetAdd").getValue();
                var sStreetNo = this.oView.byId("idStreetNo").getValue();
                var sCity = this.oView.byId("idCity").getValue();
                var sZipcode = this.oView.byId("idzipcode").getValue();
                var sNo_of_Lines = this.oView.byId("idNoofline").getValue();
                var sService_center = this.oView.byId("idsrvcenter").getValue();
                var sCable_No = this.oView.byId("idcableno").getValue();
                var sPSW_Diagram = this.oView.byId("idPswdigram").getValue();
                var sPrimery_SR = this.oView.byId("idPrimarySRep").getSelectedKey();
                var sAccount_rep = this.oView.byId("idAcRep").getValue();
                var sSubstation = this.oView.byId("idSubstation").getValue();
                var sSketch_no = this.oView.byId("idSrvSketchno").getValue();
                var sCircuit = this.oView.byId("idCircuit").getValue();

                if (!sCustName && !sMailingName && !sStreetAdd && !sStreetNo && !sCity && !sZipcode
                    && !sNo_of_Lines && !sService_center && !sCable_No && !sPSW_Diagram && !sPrimery_SR && !sAccount_rep
                    && !sSubstation && !sSketch_no && !sCircuit) {
                        sap.m.MessageBox.show(
                            "Kindly fill out at least one filter with a value.", {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        return false
                    }
                 

                var aFilters = [];
                aFilters.push(new Filter("cust_name", FilterOperator.EQ, sCustName));
                aFilters.push(new Filter("mail_name", FilterOperator.EQ, sMailingName));
                aFilters.push(new Filter("street_name", FilterOperator.EQ, sStreetAdd));
                aFilters.push(new Filter("street_no", FilterOperator.EQ, sStreetNo));
                aFilters.push(new Filter("city", FilterOperator.EQ, sCity));
                aFilters.push(new Filter("zip_code", FilterOperator.EQ, sZipcode));
                aFilters.push(new Filter("no_of_lines", FilterOperator.EQ, sNo_of_Lines));
                aFilters.push(new Filter("srv_centre", FilterOperator.EQ, sService_center));
                aFilters.push(new Filter("cable_no", FilterOperator.EQ, sCable_No));
                aFilters.push(new Filter("doc_id", FilterOperator.EQ, sPSW_Diagram));
                aFilters.push(new Filter("psr", FilterOperator.EQ, sPrimery_SR));
                aFilters.push(new Filter("acc_rep", FilterOperator.EQ, sAccount_rep));
                aFilters.push(new Filter("sub_station", FilterOperator.EQ, sSubstation));
                aFilters.push(new Filter("sketch_no", FilterOperator.EQ, sSketch_no));
                aFilters.push(new Filter("circuit", FilterOperator.EQ, sCircuit));
                this.oBusyIndicator.open();
                this.getOwnerComponent().getModel().read("/Customer_searchSet", {
                    filters: [aFilters],
                    success: function (oData) {
                        that.oBusyIndicator.close()
                        if (oData.results.length > 0) {
                            that.oView.byId("idNoofRec").setText(oData.results.length);
                            oSearchCustomerJModel.setProperty("/CustomersData", oData.results);
                        } else {
                            oSearchCustomerJModel.setData([]);
                            that.oView.byId("idNoofRec").setText(oData.results.length);
                        }
                    }, 
                    error: function (error) {
                        that.oBusyIndicator.close();
                        sap.m.MessageBox.show(
                            error.statusText, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                        oSearchCustomerJModel.setData([]);
                        that.oView.byId("idNoofRec").setText("");
                    }
                });
            },
            //********************************End*********************************/


            // fetchItems2: function () {
            //     // var City = this.getView().byId("idcity").getValue();
            //     var sCustName = this.oView.byId("idcustomer").getValue();
            //     var sMailingName = this.oView.byId("idMailingname").getValue();
            //     var sStreetAdd = this.oView.byId("idStreetAdd").getValue();
            //     var sStreetNo = this.oView.byId("idStreetNo").getValue();
            //     var sCity = this.oView.byId("idCity").getValue();
            //     var sZipcode = this.oView.byId("idzipcode").getValue();
            //     var sNo_of_Lines = this.oView.byId("idNoofline").getValue();
            //     var sService_center = this.oView.byId("idsrvcenter").getValue();
            //     var sCable_No = this.oView.byId("idcableno").getValue();
            //     var sPSW_Diagram = this.oView.byId("idPswdigram").getValue();
            //     var sPrimery_SR = this.oView.byId("idPrimarySRep").getSelectedKey();
            //     var sAccount_rep = this.oView.byId("idAcRep").getValue();
            //     var sSubstation = this.oView.byId("idSubstation").getValue();
            //     var sSketch_no = this.oView.byId("idSrvSketchno").getValue();
            //     var sCircuit = this.oView.byId("idCircuit").getValue();

            //     var sFilter = "Customer_searchSet?$filter=cust_name eq '" + sCustName + "' and mail_name eq '"
            //         + sMailingName + "' and street_name eq '" + sStreetAdd + "' and street_no eq '" + sStreetNo + "' and city eq '"
            //         + sCity + "' and zip_code eq '" + sZipcode + "' and no_of_lines eq '" + sNo_of_Lines + "' and srv_centre eq '"
            //         + sService_center + "' and cable_no eq '" + sCable_No + "' and doc_id eq '" + sPSW_Diagram + "' and psr eq '"
            //         + sPrimery_SR + "' and acc_rep eq '" + sAccount_rep + "' and sub_station eq '" + sSubstation + "' and sketch_no eq '"
            //         + sSketch_no + "' and circuit eq '" + sCircuit + "'";
            //     utilModel.readOData("", sFilter, this.fnSuccessUpdateListmat, this, 1);
            // },

            // fnSuccessUpdateListmat: function (oData) {
            //     var oSearchCustomerJModel = this.oView.getModel("oSearchCustomerJModel");
            //     // if (oData.results[0].Type === "E") {
            //     //  sap.m.MessageBox.show(
            //     //      oData.results[0].Message, {
            //     //          icon: sap.m.MessageBox.Icon.ERROR,
            //     //          title: "Error",
            //     //          actions: [sap.m.MessageBox.Action.OK]
            //     //      });
            //     // }

            //     if (oData.results.length === 0) {
            //         sap.m.MessageBox.show("No data found", {
            //             icon: sap.m.MessageBox.Icon.ERROR,
            //             title: "Error",
            //             actions: [sap.m.MessageBox.Action.OK]
            //         });
            //         oSearchCustomerJModel.setData(oData.results);
            //         this.oView.byId("idNoofRec").setText(oData.results.length);
            //     } else {
            //         if (oData.results.length > 0) {
            //             this.oView.byId("idNoofRec").setText(oData.results.length)
            //             oSearchCustomerJModel.setProperty("/CustomersData", oData.results);
            //         }


            //     }

            // },
           
            //****************************Navigating to View2 page***************************/
            handleSelectionChange: function (oEvt) {
                var oContext = oEvt.getSource().getBindingContext("oSearchCustomerJModel").getProperty();
                var oCustomerAttributesJModel = this.getOwnerComponent().getModel("oCustomerAttributesJModel");
                oCustomerAttributesJModel.setData(oContext);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CustomerDetails", {
                    scope: "cd_create"
                });
            },
            //********************************End*********************************/

            //************************Live filter within table's records*******************/
            handleTableSearch: function (oEvet) {
                var sValue = oEvet.getSource().getValue();
                var oFilter = new Filter("cust_name", FilterOperator.Contains, sValue);
                var oFilter1 = new Filter("mail_name", FilterOperator.Contains, sValue);
                var oFilter2 = new Filter("street_name", FilterOperator.Contains, sValue);
                var oFilter3 = new Filter("street_no", FilterOperator.Contains, sValue);
                var oFilter4 = new Filter("city", FilterOperator.Contains, sValue);
                var oFilter5 = new Filter("zip_code", FilterOperator.Contains, sValue);
                var oFilter6 = new Filter("no_of_lines", FilterOperator.Contains, sValue);
                var oFilter7 = new Filter("srv_centre", FilterOperator.Contains, sValue);
                var oFilter8 = new Filter("cable_no", FilterOperator.Contains, sValue);
                var oFilter9 = new Filter("sketch_no", FilterOperator.Contains, sValue);
                var oFilter10 = new Filter("doc_id", FilterOperator.Contains, sValue);
                var oFilter11 = new Filter("psr", FilterOperator.Contains, sValue);
                var oFilter12 = new Filter("acc_rep", FilterOperator.Contains, sValue);
                var oFilter13 = new Filter("sub_station", FilterOperator.Contains, sValue);
                var oFilter14 = new Filter("circuit", FilterOperator.Contains, sValue);
                var oFilter15 = new Filter("conn_obj", FilterOperator.Contains, sValue);
                var oFilterFinal = new Filter([oFilter, oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7,
                    oFilter8, oFilter9, oFilter10, oFilter11, oFilter12, oFilter13, oFilter14, oFilter15], false);
                this.oView.byId("idCustomerListTable").getBinding("items").filter([oFilterFinal]);
            },
            //********************************End*********************************/

            //*************************Adding Column Filters********************************/    
            onTableColumnFilterButtonPress: function () {
                var oModel = this.oView.getModel("oSearchCustomerJModel");
                var oGet_dat = oModel.getProperty("/CustomersData");
                if (oGet_dat.length > 0) {
                    if (!this._oColumnFilterDialog) {
                        this._oColumnFilterDialog = sap.ui.xmlfragment("idColumnFiltersFrag", "com.pso.customerrecord.fragment.ColumnFilters", this);
                        this.getView().addDependent(this._oColumnFilterDialog)
                    }
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCustName").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragMailingName").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragBillingentity").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetAdd").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetNo").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idFragCity").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragZipcode").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragNoofLines").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSrvCenter").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCableNo").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragpswdigram").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragPrimerySrvRep").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragAccRep").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSubstation").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSketchNo").setValue("");
                    sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCircuit").setValue("");

                    this._oColumnFilterDialog.open();
                }
            },
            onValidReportsColumnFilterConfirm: function () {
                var oTable = this.getView().byId("idCustomerListTable");
                var oItems = oTable.getBinding("items");
                var sCust_Name = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCustName").getValue()
                    , sMailing_Name = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragMailingName").getValue()
                    , sBillingEntity = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragBillingentity").getValue()
                    , sStreet_Add = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetAdd").getValue()
                    , sStreet_No = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragStreetNo").getValue()
                    , sCity = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idFragCity").getValue()
                    , sZip = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragZipcode").getValue()
                    , sNoofLines = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragNoofLines").getValue()
                    , sSrv_center = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSrvCenter").getValue()
                    , sCable_No = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCableNo").getValue()
                    , sPSW_Diagram = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragpswdigram").getValue()
                    , sPrimerySrv_rep = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragPrimerySrvRep").getValue()
                    , sAccount_rep = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragAccRep").getValue()
                    , sSubstation = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSubstation").getValue()
                    , sSketch_no = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragSketchNo").getValue()
                    , sCircuit = sap.ui.core.Fragment.byId("idColumnFiltersFrag", "idfragCircuit").getValue();
                if (sCust_Name === "" && sMailing_Name === "" && sBillingEntity === "" && sStreet_Add === "" && sStreet_No === "" && sCity === "" && sZip === ""
                    && sNoofLines === "" && sSrv_center === "" && sCable_No === "" && sPSW_Diagram === "" && sPrimerySrv_rep === ""
                    && sAccount_rep === "" && sSubstation === "" && sSketch_no === "" && sCircuit === "") {
                    oItems.filter([])
                } else { 
                    var oArray = [];
                    if (sCust_Name !== "") {
                        oArray.push(new Filter("cust_name", FilterOperator.EQ, sCust_Name))
                    }
                    if (sMailing_Name !== "") {
                        oArray.push(new Filter("mail_name", FilterOperator.EQ, sMailing_Name))
                    }
                    if (sBillingEntity !== "") {
                        oArray.push(new Filter("conn_obj", FilterOperator.EQ, sBillingEntity))
                    }
                    if (sStreet_Add !== "") {
                        oArray.push(new Filter("street_name", FilterOperator.EQ, sStreet_Add))
                    }
                    if (sStreet_No !== "") {
                        oArray.push(new Filter("street_no", FilterOperator.EQ, sStreet_No))
                    }
                    if (sCity !== "") {
                        oArray.push(new Filter("city", FilterOperator.EQ, sCity))
                    }
                    if (sZip !== "") {
                        oArray.push(new Filter("zip_code", FilterOperator.EQ, sZip))
                    }
                    if (sNoofLines !== "") {
                        oArray.push(new Filter("no_of_lines", FilterOperator.EQ, sNoofLines))
                    }
                    if (sSrv_center !== "") {
                        oArray.push(new Filter("srv_centre", FilterOperator.EQ, sSrv_center))
                    }
                    if (sCable_No !== "") {
                        oArray.push(new Filter("cable_no", FilterOperator.EQ, sCable_No))
                    }
                    if (sPSW_Diagram !== "") {
                        oArray.push(new Filter("doc_id", FilterOperator.EQ, sPSW_Diagram))
                    }
                    if (sPrimerySrv_rep !== "") {
                        oArray.push(new Filter("psr", FilterOperator.EQ, sPrimerySrv_rep))
                    }
                    if (sAccount_rep !== "") {
                        oArray.push(new Filter("acc_rep", FilterOperator.EQ, sAccount_rep))
                    }
                    if (sSubstation !== "") {
                        oArray.push(new Filter("sub_station", FilterOperator.EQ, sSubstation))
                    }
                    if (sSketch_no !== "") {
                        oArray.push(new Filter("sketch_no", FilterOperator.EQ, sSketch_no))
                    }
                    if (sCircuit !== "") {
                        oArray.push(new Filter("circuit", FilterOperator.EQ, sCircuit))
                    }
                    var sConsData = new Filter(oArray, true);
                    oItems.filter(sConsData)
                }
            },
            //********************************End*********************************/

            //*****************************Removing Column Filters***********************/
            onValidReportsColumnFilterCancel: function () {
                var oTable = this.getView().byId("idCustomerListTable");
                var oItems = oTable.getBinding("items");
                    oItems.filter([]);
            },
            onValidReportsColumnFilterRemove: function () {
                var oTable = this.getView().byId("idCustomerListTable");
                var oItems = oTable.getBinding("items");
                oItems.filter([])
            },
            //********************************End*********************************/

            //********************************Add Sorting in table******************************/  
            onValidReportsTableSorting: function (e) {
                this._getValidReportsTableSortDialog().open()
            },
            _getValidReportsTableSortDialog: function () {
                var e = this.oView.getModel("oSearchCustomerJModel");
                if (!this._oValidReportsTableSortDialog) {
                    this._oValidReportsTableSortDialog = sap.ui.xmlfragment(this.createId("idValidReportsTableSortFrag"), "com.pso.customerrecord.fragment.TableSort", this);
                    this.getView().addDependent(this._oValidReportsTableSortDialog)
                }
                return this._oValidReportsTableSortDialog
            },
            onTableSortConfirm: function (e) {
                var sKey = e.getParameter("sortItem").getKey()
                    , sSortDece = e.getParameter("sortDescending");
                var sTable = this.getView().byId("idCustomerListTable")
                    , sTableButton = this.getView().byId("idTableSort");
                this._oValidReportsTableSortSelection = {
                    path: sKey,
                    desc: sSortDece
                };
                sTableButton.setType("Emphasized");
                var sSorter = new sap.ui.model.Sorter(this._oValidReportsTableSortSelection.path, this._oValidReportsTableSortSelection.desc);
                sTable.getBinding("items").sort(sSorter)
            },
            //********************************End*********************************/

            //*************************Export table records in excel*********************/
            onValidReportsTableExport: function () {
                var oClumn_Config, oRecords, oObject, oSpradeSheet, oText; 
                var oModel = this.oView.getModel("oSearchCustomerJModel");
                var oRecords = oModel.getProperty("/CustomersData");
                var oReource = this.getResourceBundle();
                oText = oReource.getText("customerReport");
                if (oRecords.length > 0) { 
                    oClumn_Config = this.getColumnConfig(oReource);
                    oObject = {
                        workbook: {
                            columns: oClumn_Config
                        },
                        dataSource: oRecords,
                        fileName: oText + ".xlsx",
                        worker: true,
                        sheetName :"Customer Records",
                        metaSheetName:"Customer Records",
                        title : "Customer Records",
                        application:"Records"
                    };
                    oSpradeSheet = new Spreadsheet(oObject);
                    oSpradeSheet.build().finally(function () {
                        oSpradeSheet.destroy()
                    })
                }
            },
            getColumnConfig: function (oClumn_Config) {
                var oRecords = [];
                oRecords.push({
                    label: oClumn_Config.getText("Fcutname"),
                    type: sap.ui.export.EdmType.String,
                    property: "cust_name",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FMailingname"), 
                    type: sap.ui.export.EdmType.String,
                    property: "mail_name",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FBillingEntity"), 
                    type: sap.ui.export.EdmType.String,
                    property: "conn_obj",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FStreetAdd"),
                    type: sap.ui.export.EdmType.String,
                    property: "street_name",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FStreetNo"),
                    type: sap.ui.export.EdmType.String,
                    property: "street_no",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fcity"),
                    type: sap.ui.export.EdmType.String,
                    property: "city",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("FZipcod"),
                    type: sap.ui.export.EdmType.String,
                    property: "zip_code",
                    width: 20,
                    wrap: true
                });

                oRecords.push({
                    label: oClumn_Config.getText("FNumberoflines"),
                    type: sap.ui.export.EdmType.String,
                    property: "no_of_lines",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fsrvcenter"),
                    type: sap.ui.export.EdmType.String,
                    property: "srv_centre",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fcableno"),
                    type: sap.ui.export.EdmType.String,
                    property: "cable_no",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fsrvsktchno"),
                    type: sap.ui.export.EdmType.String,
                    property: "sketch_no",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fpswidigram"),
                    type: sap.ui.export.EdmType.String,
                    property: "doc_id",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fprimeryrvrep"),
                    type: sap.ui.export.EdmType.String,
                    property: "psr",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Faccountrp"),
                    type: sap.ui.export.EdmType.String,
                    property: "acc_rep",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fsustatoin"),
                    type: sap.ui.export.EdmType.String,
                    property: "sub_station",
                    width: 20,
                    wrap: true
                });
                oRecords.push({
                    label: oClumn_Config.getText("Fcircuit"),
                    type: sap.ui.export.EdmType.String,
                    property: "circuit",
                    width: 20,
                    wrap: true
                });

                return oRecords
            },
            //********************************End*********************************/

            //*************************Get value of resorce model***************************/
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            /**************************Getting User's cope*********************/
            getUserScope: async function () {
                var sUserName,
                    sScopes = null;
                await fetch("/getUserInfo")
                    .then(res => res.json())
                    .then(data => {
                        sUserName = data.decodedJWTToken.email;
                        sScopes = data.decodedJWTToken.scope;
                    });
                console.log(sUserName);
                console.log(sScopes);

                var currentScope;
                for (var i = 0; i < sScopes.length; i++) {
                    if (sScopes[i].includes('pso_customer_details_create')) {
                        console.log("scope = pso_customer_details_create");
                        currentScope = "cd_create"
                    }
                    else if (sScopes[i].includes('pso_customer_details_display')) {
                        console.log("scope = pso_customer_details_display");
                        currentScope = "cd_display"
                    }
                }
                this.currentScope = currentScope;
                //   return sScopes;

            },
            //********************************End*********************************/

            //***********************Clearing all filters*************************/
            onClear:function(){
                var oSearchCustomerJModel = this.getOwnerComponent().getModel("oSearchCustomerJModel");
                oSearchCustomerJModel.setProperty("/CustomersData", []);
                this.oView.byId("idcustomer").setValue();
                this.oView.byId("idMailingname").setValue();
                this.oView.byId("idStreetAdd").setValue();
                this.oView.byId("idStreetNo").setValue();
                this.oView.byId("idCity").setValue();
                this.oView.byId("idzipcode").setValue();
                this.oView.byId("idNoofline").setValue();
                this.oView.byId("idsrvcenter").setValue();
                this.oView.byId("idcableno").setValue();
                this.oView.byId("idPswdigram").setValue();
                this.oView.byId("idPrimarySRep").setSelectedKey();
                this.oView.byId("idAcRep").setValue();
                this.oView.byId("idSubstation").setValue();
                this.oView.byId("idSrvSketchno").setValue();
                this.oView.byId("idCircuit").setValue();
                this.oView.byId("idNoofRec").setText("0");  
            },
            //********************************End*********************************/

            //********************Capitialize first later of each word *******************/
            onCapitalizeFirtsLater:function(oEvent){
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();
            // Capitalize the first letter of each word
            var sCapitalizedValue = this.capitalizeFirstLetterOfEachWord(sValue);
            // Set the formatted value back to the input field
            oInput.setValue(sCapitalizedValue);
        },
 
        capitalizeFirstLetterOfEachWord: function (str) {
            return str.replace(/\b\w/g, function (char) {
                return char.toUpperCase();
            });
        }
        //********************************End*********************************/
            




        });
    });
