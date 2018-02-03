(typeof window.tpWeb === 'undefined') ? (window.tpWeb = {}) : void(0);
tpWeb.article = (function () {
    /// 附加信息部分
    /// @type {jQuery}
    var $moreInfo,
    /// feedback提交的地址
    /// @type {String}
        url,
    /// 反馈字段
    /// @type {String} 只能取值Yes No Somewhat
        yesOrNo,
    /// 显示全部部分初始化
        colInitA = function () {
            var $faqModel = $moreInfo.find('.col-a .faq-model');
            var $faqFullModel = $moreInfo.find('.col-a .faq-full-model');
            var $button = $moreInfo.find('.col-a button');
            $button.on('click', function () {
                $faqModel.hide();
                $faqFullModel.show();
            });
        },
    /// 用户反馈部分初始化
        colInitB = function () {
            var $feedback = $moreInfo.find('.col-b .feedback');
            var $input = $moreInfo.find('.col-b .input');
            var $thanks = $moreInfo.find('.col-b .thanks');
            var $textarea = $moreInfo.find('.col-b .input textarea');
            $moreInfo.find('.col-b button.yes').click(function () {
                yesOrNo = 'Yes';
                $feedback.hide();
                $input.show();
                $input.find('.label.yes').show();
            });
            $moreInfo.find('.col-b button.somewhat').click(function () {
                yesOrNo = 'Somewhat';
                $feedback.hide();
                $input.show();
                $input.find('.label.somewhat').show();
            });
            $moreInfo.find('.col-b button.no').click(function () {
                yesOrNo = 'No';
                $feedback.hide();
                $input.show();
                $input.find('.label.no').show();
            });
            $moreInfo.find('.col-b button.submit').click(function () {
                $input.hide();
                $thanks.show();
                $.get(url.replace(/\{YesOrNo\}/ig, yesOrNo).replace(/\{feedback\}/ig, encodeURIComponent($textarea.val() || '')));
            });
            $moreInfo.find('.col-b button.not-submit').click(function () {
                $input.hide();
                $thanks.show();
                $.get(url.replace(/\{YesOrNo\}/ig, yesOrNo).replace(/\{feedback\}/ig, ''));
            });

        };

    return {
        init: function (config) {
            if (config && config.$element && config.url) {
                $moreInfo = config.$element;
                url = config.url+'&version='+(new Date());
                colInitA();
                colInitB();
            }
        }
    };
})();

