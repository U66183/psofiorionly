jQuery.sap.declare('com.pso.customerrecord.js.Formatter');

com.pso.customerrecord.js.Formatter = {
    //Display Icon
    setIcon:function(status){
        if(status ==="X"){
            return "sap-icon://tree";
        }
    },

    setColor:function(status){
        if(status ==="X"){
            return "orange";
        }
    }
};