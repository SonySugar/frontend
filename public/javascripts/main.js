
$('#slipClick').click(function() {
    document.getElementById("customerEslipNumber").value = 'eslip' + Math.floor((Math.random() * 1000) + 1);
});

$('#submitFormPost').click(function () {
    $("#submit-cg" ).trigger( "click" );
});