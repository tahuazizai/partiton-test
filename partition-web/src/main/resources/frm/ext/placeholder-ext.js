/**
 * @class fish.desktop.widget.placeholder
 * IE8 placeholder 插件
 */
(function (window, document, $) {

    //id字段自增放到全局变量中.
    var holderCount = 0;

    /**
     * @cfg {Boolean} [RTL=false] 是否从右向左
     */

    $.fn.placeholder = function (options) {
        if (!options) {
            options = {};
        }
        var i = document.createElement('input'),
            placeholdersupport = 'placeholder' in i;
        if (!placeholdersupport) {

            this.each(function (index) {
                var input = $(this);

                //已经生成过对应的placeholder就不再生成了
                if(input.data("placeholder_label")){
                    return;
                }
                var inputParent = input.parent();
                if (inputParent.css('position') === 'static') {
                    inputParent.css('position', 'relative');
                }

                var inputId = input.attr('id');
                if (!inputId) {
                    inputId = 'placeholder' + (holderCount++);
                    input.attr('id', inputId);
                }

                var label = $('<label class="placeholder"></label>');
                label.attr('for', inputId);
                label.text(input.attr('placeholder'));

                input.data("placeholder_label", label);

                var labelClass = input.data('class');
                if (labelClass) {
                    label.addClass(labelClass);
                }

                var position = input.position();
                var css = {
                    'position': 'absolute',
                    //'top': position.top + 1,
                    'top': position.top ,
                    'cursor': 'text',
                    'z-index': 3,
                    'height': input.innerHeight(),
                    'line-height': input.innerHeight() + 'px'
                };
                if (options.RTL) {
                    var offsetRight = inputParent.outerWidth() - input.outerWidth() - input.position()['left'];
                    css['right'] = offsetRight + 6;
                } else {
                    css['left'] = position.left + 6;
                }
                label.css(css);

                if (this.value.length) {
                    label.hide();
                }

                input.after(label);

                input.on({
                    focus: function () {
                        label.hide();
                    },
                    blur: function () {
                        if (this.value == '' ) {
                            label.show();
                        }
                    },
                    "change.placeholder": function () {
                        // 修正input对象调用val()方法赋值后在IE9下无法捕获change事件的错误
                        // 该错误会导致修改后placeholder不隐藏的问题
                        // 在设置val值的地方手动派发该事件
                        input.val() ? label.hide() : label.show();
                    }
                });

                this.attachEvent('onpropertychange', function () {
                    input.val() ? label.hide() : label.show();
                });
            })
        }
        return this;
    }
})(this, document, jQuery);