 // Check whether the element is checkbox or radio
    function checkable(el) {
        return el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio');
    }


!function () {
    "use strict";
    $.widget("ui.validator", $.ui.validator, {
        _validate: function (el, field) {
            var me = this,
                forceValidate = false;

            field = field || me.getField(el);
            if(!field) {
                return;
            }

            // 判断是否开启强制校验
            if (field.rules) {
                for (var i = 0; i < field.rules.length; i++) {
                    if (field.rules[i].method === "force") {
                        forceValidate = true;
                        break;
                    }
                }
            } else {
                if (field.rule && (field.rule.indexOf("force") > 0)) {
                    forceValidate = true;
                }
            }
            // doesn't validate the element that has "disabled" without "force" attribute
            if (el.disabled && !forceValidate) {
                return;
            }

            var msgOpt = {},
                group = field.group,
                ret,
                isValid = field.isValid = true;

            if (!field.rules) {
                me._parse(el);
            }

            // group validation
            if (group) {
                ret = group.callback.call(me, group.$elems);
                if (ret !== undefined) {
                    me.hideMsg(group.target, {}, field);
                    if (ret === true) {
                        ret = undefined;
                    } else {
                        field._i = 0;
                        field._r = 'group';
                        isValid = false;
                        me.hideMsg(el, {}, field);
                        $.extend(msgOpt, group);
                    }
                }
            }
            // if the field is not required and it has a blank value
            if (isValid && !field.required && !field.must && !el.value) {
                if ($(el).attr('data-inputstatus') === 'tip') {
                    return;
                }
                if (!checkable(el)) {
                    me._validatedField(el, field, {
                        isValid: true
                    });
                    return;
                }
            }

            // if the results are out
            if (ret !== undefined) {
                me._validatedRule(el, field, ret, msgOpt);
            } else if (field.rule) {
                me._checkRule(el, field);
            }
        }
    });

    /**
     * 增加charLength验证规则
     * 验证字段长度，与数据库验证结果匹配
     * 依照oracle使用 ZHS16GBK 字符集，汉字/全角字符使用两字节编码，字母/数字为一个字节
     * 使用方法与内置的length规则相同
     * 使用波浪线（~）表示数字范围，例如：6~（大于等于6）、~6（小于等于6）、6~16（6到16）
     */
    $.ui.validator.addRule('charLength', {
        eq: "请输入 {1} 个字符",
        gte: "请输入至少 {1} 个字符",
        lte: "请输入最多 {1} 个字符",
        rg: "请输入 {1} 到 {2} 个字符"
    }, function (element, param, field) {
        var me = this,
            len = 0,
            val = $(element).val(),
            msg = me.messages["charLength"] || '',
            p = param[0].split('~'),
            leftArg = p[0],
            rightArg = p[1],
            c = 'rg',
            args = [''];

        for (var i = 0; i < val.length; i++) {
            var a = val.charAt(i);
            // 使用正则匹配两个字节以上的字符
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            }
            else {
                len += 1;
            }
        }

        if (p.length === 2) {
            if (leftArg && rightArg) {
                if (len >= +leftArg && len <= +rightArg) {
                    return true;
                }
                args = args.concat(p);
            } else if (leftArg && !rightArg) {
                if (len >= +leftArg) {
                    return true;
                }
                args.push(leftArg);
                c = 'gte';
            } else if (!leftArg && rightArg) {
                if (len <= +rightArg) {
                    return true;
                }
                args.push(rightArg);
                c = 'lte';
            }
        } else {
            if (len === +leftArg) {
                return true;
            }
            args.push(leftArg);
            c = 'eq';
        }

        if (msg) {
            args[0] = msg[c];
        }

        return me.renderMsg.apply(null, args);
    });
}();