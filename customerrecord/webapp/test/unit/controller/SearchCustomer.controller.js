/*global QUnit*/

sap.ui.define([
	"compso/customerrecord/controller/SearchCustomer.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SearchCustomer Controller");

	QUnit.test("I should test the SearchCustomer controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
