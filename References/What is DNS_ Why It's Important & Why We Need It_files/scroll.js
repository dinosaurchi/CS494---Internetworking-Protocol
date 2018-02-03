$('#feature-1').on('inview.uk.scrollspy', function(){
    $("#screenshot-1").show();
    $("#screenshot-2").hide();
    $("#screenshot-3").hide();
});

$('#feature-2').on('inview.uk.scrollspy', function(){
    $("#screenshot-1").hide();
    $("#screenshot-2").show();
    $("#screenshot-3").hide();
});

$('#feature-3').on('inview.uk.scrollspy', function(){
	$("#screenshot-1").hide();
    $("#screenshot-2").hide();
    $("#screenshot-3").show();
});