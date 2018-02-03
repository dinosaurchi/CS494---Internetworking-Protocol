$('#email_submit_btn').click(function(){ 
	tpWeb.fn.loadScript('/res/js/cxtutils/lightbox.js');
	var $form = $('#dlJoinUsForm form');
	$email =  $form.find('input[name="email"]');
	var email = $email.val();
	if (email == '' || !isEmail(email)) {
		$form.addClass('error');
		$email.focus();
		return;
	}
	var showLightbox = function (content, showOKButton) {
		var defaultRegionID = 68;//World Wide as default.
		if (content.indexOf('<option value="' + defaultRegionID + '">') == -1) defaultRegionID = null;
		var id = 'edmFormLightbox';
		var html = ('<div class="utils clearfix"><a href="javascript:;" class="close">Close</a></div>'
		+ '<div class="content">'
		+ '<div class="inner-box">${Content}</div>'
		+ '</div>'
		+ '<b class="bg"> </b>').replace(/\$\{Content\}/gi, content)
		.replace(/\${Button\}/gi, showOKButton ? '<button type="button" value="OK" class="round-button">&nbsp;&nbsp;&nbsp;&nbsp;OK&nbsp;&nbsp;&nbsp;&nbsp;</button>' : '');
		cxtUtils.lightbox.show(html, id, 'lightbox-gallery video edm', 'auto', typeof(defaultRegionID) == 'number' ? 100 : 400);
		var $lightbox = $('#' + id);
		$lightbox.find('a.close').add($lightbox.find('button[value="OK"]')).click(function () { $lightbox.remove(); });
	}
	$.ajax({
		type: 'POST',
		url: $form.data('rootUrl') + 'register-edm.html',
    timeout: 5000,
		data: {email: email },
		success: function (responseText) {
			showLightbox(responseText.message, true);
			userType = undefined;
			$email.val('');
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
			//$lightbox.remove();
			showLightbox('Response error!', true);
		}
	});
});
var isEmail = function (v) { return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/i.test(v); };
