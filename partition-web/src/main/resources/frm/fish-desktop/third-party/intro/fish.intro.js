/**
 * 第三方组件，页面初次引导<br>
 * @class fish.desktop.widget.Intro
 * @extends fish.desktop.widget
 *
 * 用法:<br/>
 *      <pre>$(document.body).intro().intro('start');</pre>
 */
!function() {
    $.widget('ui.intro', {
        options: {
            /**
             * @cfg {String} NextLabel='Next &rara;' 提示框里面【下一步】按钮显示的文本
             */
            nextLabel: 'Next &rarr;',
            /**
             * @cfg {String} prevLabel='&larr; Back' 提示框里面【上一步】按钮显示的文本
             */
            prevLabel: '&larr; Back',
            /**
             * @cfg {String} skipLabel='Skip' 提示框里面【跳过】按钮显示的文本
             */
            skipLabel: 'Skip',
            /**
             * @cfg {String} doneLabel='done' 提示框里面【完成】按钮显示的文本
             */
            doneLabel: 'Done',
            /**
             * @cfg {String} toolTipPosition='bottom' 提示框默认显示的位置
             */
            toolTipPosition: 'bottom',
            /**
             * @cfg {String} toolTipClass='' 提示框里面【下一步】按钮的CSS样式
             */
            toolTipClass: '',
            /**
             * @cfg {Boolean} exitOnEsc=true 在按下ESC按钮的时候是否要关闭引导
             */
            exitOnEsc: true,
            /**
             * @cfg {Boolean} exitOnOverlayClick=true 在点击外部区域的时候是否要关闭引导
             */
            exitOnOverlayClick: true,
            /**
             * @cfg {Boolean} showStepNumbers=true 是否要在引导组件上显示第几步数字
             */
            showStepNumbers: true,
            /**
             * @cfg {Boolean} keyboardNavigation=true 是否让用户可以通过键盘进行导航
             */
            keyboardNavigation: true,
            /**
             * @cfg {Boolean} showButtons=true 是否显示导航控制按钮
             */
            showButtons: true,
            /**
             * @cfg {Boolean} showBullets=true 是否显示导航特效
             */
            showBullets: true,
            /**
             * @cfg {Boolean} scrollToElement=true  是否滚动到高亮的元素
             */
            scrollToElement: true,
            /**
             * @cfg {Number} overlayOpacity=0.8 设置遮罩层的透明度
             */
            overlayOpacity: 0.5,
            /**
             * @cfg {boolean} rtl=fasle 把文本设置为从右到左显示，默认为false(LTR从左向右)
             */
            rtl: false,

            //event callback
            /**
             * beforeChange事件回调
             * @event beforeChange
             * @param {Event} event Event Object
             * @param {Object} ui intro Object
             */
            beforeChange: $.noop,
            /**
             * change事件回调
             * @event change
             * @param {Event} event Event Object
             * @param {Object} ui intro Object
             */
            change: $.noop,
            /**
             * afterChange事件回调
             * @event afterChange
             * @param {Event} event Event Object
             * @param {Object} ui intro Object
             */
            afterChange: $.noop,
            /**
             * complete事件回调
             * @event complete
             * @param {Event} event Event Object
             * @param {Object} ui intro Object
             */
            complete: $.noop,
            /**
             * exit事件回调
             * @event exit
             * @param {Event} event Event Object
             * @param {Object} ui intro Object
             */
            exit: $.noop
        },
        _create: function() {
            var $el = this.element;

            this.options = $.extend({}, this.options, {
                nextLabel: $el.data('next-label'),
                prevLabel: $el.data('prev-label'),
                skipLabel: $el.data('skip-label'),
                doneLabel: $el.data('done-label'),
                toolTipPosition: $el.data('tooltip-position'),
                toolTipClass: $el.data('tooltip-class'),
                exitOnEsc: $el.data('exit-on-esc'),
                exitOnOverlayClick: $el.data('exit-on-overlay-click'),
                showStepNumbers: $el.data('show-step-numbers'),
                keyboardNavigation: $el.data('keyboard-navigation'),
                showButtons: $el.data('show-buttons'),
                showBullets: $el.data('show-bulltets')
            });

        },
        _init: function() {},
        _destroy: function() {},

        _start: function() {
            var introItems = [],
                self = this,
                $el = this.element;

            if (this.options.steps) {
                var allIntroSteps = [];
                for (var i = 0, stepsLength = this.options.steps.length; i < stepsLength; i++) {
                    var currentItem = $.extend(true, {}, this.options.steps[i]);
                    //set the step
                    currentItem.step = introItems.length + 1;
                    //use querySelector function only when developer used css selector
                    if (typeof(currentItem.element) === 'string') {
                        currentItem.element = $(currentItem.element);
                    }

                    if (currentItem.element != null) {
                        introItems.push(currentItem);
                    }
                }

            } else {
                //use steps from data-* annotations
                var allIntroSteps = $el.find('*[data-intro]');
                //if there's no element to intro
                if (allIntroSteps.length < 1) {
                    return false;
                }

                //first add intro items with data-step
                for (var i = 0, elmsLength = allIntroSteps.length; i < elmsLength; i++) {
                    var $currentelement = $(allIntroSteps[i]);
                    var step = parseInt($currentelement.data('step'), 10);

                    introItems[step - 1] = {
                        element: $currentelement,
                        intro: $currentelement.data('intro'),
                        step: step,
                        tooltipClass: $currentelement.data('tooltipClass'),
                        position: $currentelement.data('position') || this.options.tooltipposition
                    };
                }

            }

            //ok, sort all items with given steps
            introItems.sort(function(a, b) {
                return a.step - b.step;
            });

            //set it to the ui-intro object
            this.introItems = introItems;

            //add overlay layer to the page
            this._addOverlayLayer();

            //then, start the show
            this._nextStep();

            // handle events
            this._handleEvent();
        },
        /**
         * 绑定键盘事件
         * @private
         */
        _handleEvent: function() {
            var self = this,
                timer;

            if (this.options.keyboardNavigation === true) {
                function keydownEvent(e) {
                    if (e.keyCode === $.ui.keyCode.ESCAPE && self.options.exitOnEsc === true) { //escape key pressed, exit the intro
                        self._trigger('exit', null, self.introItems[self.currentStep]);
                        self._exitIntro();
                    } else if (e.keyCode === $.ui.keyCode.LEFT) { //left arrow
                        self._previousStep();
                    } else if (e.keyCode === $.ui.keyCode.RIGHT || e.keyCode === $.ui.keyCode.ENTER) { //right arrow or enter
                        self._nextStep();
                        //prevent default behaviour on hitting enter, to prevent steps being skipped in some browsers
                        if (e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    }
                }

                if (document.addEventListener) {
                    $(window).on('keydown.intro', keydownEvent);
                } else {
                    $(document).on('keydown.intro', keydownEvent);
                }
            }

            $(window).on("resize.intro", function(e) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    self._setHelperLayer(self.element.find('.ui-intro-helper-layer'));
                }, 150);
            });
        },

        /**
         * 给目标添加遮罩层
         * @returns {boolean}
         * @private
         */
        _addOverlayLayer: function() {
            var $overlay = $('<div class="ui-intro-overlay"></div>'),
                styletext = '',
                that = this,
                $el = this.element;

            //check if the target element is body, we should calculate the size of overlay layer in a better way
            if ($el.is(document) || $el.is(document.body)) {
                styletext += 'top: 0;bottom: 0; left: 0;right: 0;position: fixed;';
                $overlay.attr('style', styletext);
            } else {
                //set overlay layer position
                var offset = $el.offset();
                styletext += 'width:' + $el.outerwidth() + 'px';
                styletext += ',height:' + $el.outerheight() + 'px';
                styletext += ',top:' + offset.top + 'px';
                styletext += ',left:' + offset.left + 'px';
                $overlay.attr('style', styletext);
            }

            $el.append($overlay);
            $overlay.on('click', function(e) {
                if (that.options.exitOnOverlayClick === true) {
                    $overlay.off('click');
                    that._trigger('exit', null, that.introItems[that.currentStep]);
                    that._exitIntro();
                }
            });

            setTimeout(function() {
                styletext += 'opacity: ' + that.options.overlayOpacity + ';';
                $overlay.attr('style', styletext);
            }, 10);

            return true;
        },
        /**
         * 设置填出层
         * @param $helperlayer
         * @private
         */
        _setHelperLayer: function($helperlayer) {
            if ($helperlayer && $helperlayer.length != 0) {
                var currentelement = this.introItems[this.currentStep];
                //prevent error when `this.currentStep` in undefined
                if (!currentelement) return;

                var elPosition = this._getOffset(currentelement.element), //currentElement.element is $el
                    widthheightpadding = 10;

                if (currentelement.position == 'floating') {
                    widthheightpadding = 0;
                }

                //set new position to helper layer
                $helperlayer.attr('style', 'width: ' + (elPosition.width + widthheightpadding) + 'px; ' +
                    'height:' + (elPosition.height + widthheightpadding) + 'px; ' +
                    'top:' + (elPosition.top - 5) + 'px;' +
                    'left: ' + (elPosition.left - 5) + 'px;');
            }
        },

        /**
         * 最终实现弹出引导界面的
         * @param target
         * @private
         */
        _showIntro: function(target) {
            this._trigger('change', null, target);

            var self = this,
                oldhelperlayer = document.querySelector('.ui-intro-helper-layer'),
                elementposition = this._getOffset(target.element);

            if (oldhelperlayer != null) { //已经存在引导提示框
                var $oldHelperLayer = $(oldhelperlayer),
                    oldhelpernumberlayer = oldhelperlayer.querySelector('.ui-intro-helper-number-layer'),
                    oldtooltiplayer = oldhelperlayer.querySelector('.ui-intro-tooltiptext'),
                    oldarrowlayer = oldhelperlayer.querySelector('.ui-intro-arrow'),
                    oldtooltipcontainer = oldhelperlayer.querySelector('.ui-intro-tooltip'),
                    $skipBtn = $oldHelperLayer.find('.ui-intro-skipbutton'), // 没有作用域限制
                    $prevBtn = $oldHelperLayer.find('.ui-intro-prevbutton'),
                    $nextBtn = $oldHelperLayer.find('.ui-intro-nextbutton');

                //hide the tooltip
                oldtooltipcontainer.style.opacity = 0;

                if (oldhelpernumberlayer != null) {
                    var lastIntroItem = this.introItems[(target.step - 2 >= 0 ? target.step - 2 : 0)];

                    if (lastIntroItem != null && (this._direction == 'forward' && lastIntroItem.position == 'floating') || (this._direction == 'backward' && target.position == 'floating')) {
                        oldhelpernumberlayer.style.opacity = 0;
                    }
                }

                //set new position to helper layer
                this._setHelperLayer($(oldhelperlayer));

                //remove `ui-intro-fix-parent` class from the elements
                $('.ui-intro-fix-parent').removeClass('ui-intro-fix-parent');

                //remove old classes
                var oldshowelement = document.querySelector('.ui-intro-show-element');
                oldshowelement.className = oldshowelement.className.replace(/ui-intro-[a-za-z]+/g, '').replace(/^\s+|\s+$/g, '');

                //we should wait until the css3 transition is competed (it's 0.3 sec) to prevent incorrect `height` and `width` calculation
                if (self._lastshowelementtimer) {
                    clearTimeout(self._lastshowelementtimer);
                }
                self._lastshowelementtimer = setTimeout(function() {
                    //set current step to the label
                    if (oldhelpernumberlayer != null) {
                        oldhelpernumberlayer.innerHTML = target.step;
                    }
                    //set current tooltip text
                    oldtooltiplayer.innerHTML = target.intro;
                    //set the tooltip position
                    self._placeToolTip(target.element, oldtooltipcontainer, oldarrowlayer, oldhelpernumberlayer);

                    //change active bullet
                    $oldHelperLayer.find('.ui-intro-bullets li > a.active').removeClass();
                    $oldHelperLayer.find('.ui-intro-bullets li > a').each(function() {
                        var $this = $(this);
                        if ($this.data('step-number') == target.step) {
                            $this.addClass('active');
                            return false;
                        }
                    });

                    //show the tooltip
                    oldtooltipcontainer.style.opacity = 1;
                    if (oldhelpernumberlayer) oldhelpernumberlayer.style.opacity = 1;
                }, 350);

            } else {
                var $helperlayer = $('<div class="ui-intro-helper-layer"></div>'),
                    $arrowlayer = $('<div class="ui-intro-arrow"></div>'),
                    $toolTipLayer = $('<div class="ui-intro-tooltip"></div>'),
                    $toolTipTextLayer = $('<div class="ui-intro-tooltiptext"></div>').html(target.intro),
                    $bulletsLayer = $('<div class="ui-intro-bullets"></div>'),
                    $buttonsLayer = $('<div class="ui-intro-tooltipbuttons"></div>');

                if (this.options.rtl === true) {
                    $buttonsLayer.addClass('rtl');
                    $toolTipLayer.addClass('rtl');
                }

                //set new position to helper layer
                this._setHelperLayer($helperlayer);

                //add helper layer to target element
                this.element.append($helperlayer);

                if (this.options.showBullets === false) {
                    $bulletsLayer.css('display', 'none');
                }

                var $ulContainer = $('<ul>');

                for (var i = 0, stepLength = this.introItems.length; i < stepLength; i++) {
                    var $innerli = $('<li>'),
                        $anchorlink = $('<a href="javascript:void(0)">&nbsp;</a>');

                    $anchorlink.on('click', function() {
                        var step = $(this).data('step-number');
                        $ulContainer.find('li a.active').data('step-number') !== step && self.goToStep(step);
                    });

                    if (i === (target.step - 1)) {
                        $anchorlink.removeClass().addClass('active');
                    }

                    $anchorlink.data('step-number', this.introItems[i].step);
                    $innerli.append($anchorlink);
                    $ulContainer.append($innerli);
                }

                $bulletsLayer.append($ulContainer);

                (this.options.showButtons === false) && $buttonsLayer.css('display', 'none');

                $toolTipLayer.append($toolTipTextLayer).append($bulletsLayer);

                //add helper layer number
                if (this.options.showStepNumbers === true) {
                    var $helperNumberLayer = $('<span class="ui-intro-helper-number-layer">' + target.step + '</span>');
                    $helperlayer.append($helperNumberLayer);
                }
                $helperlayer.append($toolTipLayer.append($arrowlayer));

                //next button
                var $nextBtn = $('<a href="javascript:void(0)" class="ui-intro-button ui-intro-nextbutton">' + this.options.nextLabel + '</a>');
                $nextBtn.on('click', function() {
                    if (self.introItems.length - 1 != self.currentStep) {
                        self._nextStep();
                    }
                });

                //previous button
                var $prevBtn = $('<a href="javascript:void(0)" class="ui-intro-button ui-intro-prevbutton">' + this.options.prevLabel + '</a>');
                $prevBtn.on('click', function() {
                    if (self.currentStep != 0) {
                        self._previousStep();
                    }
                });

                //skip button
                var $skipBtn = $('<a href="javascript:void(0)" class="ui-intro-button ui-intro-skipbutton">' + this.options.skiplabel + '</a>');
                $skipBtn.on('click', function() {
                    if (self.introItems.length - 1 == self.currentStep) {
                        self._trigger('complete');
                    }
                    if (self.introItems.length - 1 != self.currentStep) {
                        self._trigger('exit', null, self.introItems[self.currentStep]);
                    }

                    self._exitIntro();
                });

                if (this.options.rtl === true) {
                    $skipBtn.addClass('rtl');
                }

                $buttonsLayer.append($skipBtn);

                //in order to prevent displaying next/previous button always
                (this.introItems.length > 1) && $buttonsLayer.append($prevBtn).append($nextBtn);

                $toolTipLayer.append($buttonsLayer);

                //set proper position
                this._placeToolTip(target.element, $toolTipLayer[0], $arrowlayer[0], $helperNumberLayer[0]);
            }

            if (this.currentStep == 0 && this.introItems.length > 1) { //第一个提示
                $prevBtn.addClass('ui-intro-disabled');
                $nextBtn.removeClass('ui-intro-disabled');
                $skipBtn.html(this.options.skipLabel);
            } else if (this.introItems.length - 1 == this.currentStep || this.introItems.length == 1) {
                //最后一个，或者只有一个
                $prevBtn.removeClass('ui-intro-disabled');
                $nextBtn.addClass('ui-intro-disabled');
                $skipBtn.html(this.options.doneLabel);
            } else { //中间状态
                $prevBtn.removeClass('ui-intro-disabled');
                $nextBtn.removeClass('ui-intro-disabled');
                $skipBtn.html(this.options.skipLabel);
            }

            //set focus on "next" button, so that hitting enter always moves you onto the next step
            $nextBtn.focus();

            //add target element position style
            target.element.addClass('ui-intro-show-element');

            var currentElementPosition = target.element.css('position');
            if (currentElementPosition !== 'absolute' && currentElementPosition !== 'relative') {
                //change to new intro item
                target.element.addClass('ui-intro-relative-position');
            }

            var $parent = target.element.parent();
            while ($parent != null && $parent.length != 0) {
                var node = $parent[0];
                if (node.tagName.toLowerCase() === 'body') break;

                //fix the stacking contenxt problem.
                //more detail: https://developer.mozilla.org/en-us/docs/web/guide/css/understanding_z_index/the_stacking_context
                var zindex = $parent.css('z-index');
                var opacity = parseFloat($parent.css('opacity'));
                var transform = $parent.css('transform') || $parent.css('-webkit-transform') || $parent.css('-moz-transform') || $parent.css('-ms-transform') || $parent.css('-o-transform');
                if (/[0-9]+/.test(zindex) || opacity < 1 || transform !== 'none') {
                    $parent.addClass('ui-intro-fix-parent');
                }

                $parent = $parent.parent();
            }

            if (!this._isInViewPort(target.element[0]) && this.options.scrollToElement === true) {
                var currentEl = target.element[0],
                    rect = currentEl.getBoundingClientRect(),
                    winHeight = $(window).outerHeight(),
                    top = rect.bottom - (rect.bottom - rect.top),
                    bottom = rect.bottom - winHeight;

                if (top < 0 || currentEl.clientHeight > winHeight) { //scroll up
                    window.scrollBy(0, top - 30); // 30px padding from edge to look nice

                } else { //scroll down
                    window.scrollBy(0, bottom + 100); // 70px + 30px padding from edge to look nice
                }
            }

            this._trigger('afterChange', null, target);
        },

        /**
         * 计算ToolTip位置
         * @param targetElement 目标元素（tooltip相对的元素）
         * @param tooltipLayer
         * @param arrowLayer
         * @param helperNumberLayer
         * @private
         */
        _placeToolTip: function(targetElement, tooltipLayer, arrowLayer, helperNumberLayer) {
            var tooltipCssClass = '',
                currentStepObj, tooltipOffset, targetElementOffset;

            //reset the old style
            tooltipLayer.style.top = null;
            tooltipLayer.style.right = null;
            tooltipLayer.style.bottom = null;
            tooltipLayer.style.left = null;
            tooltipLayer.style.marginLeft = null;
            tooltipLayer.style.marginTop = null;

            arrowLayer.style.display = 'inherit';

            if (typeof(helperNumberLayer) != 'undefined' && helperNumberLayer != null) {
                helperNumberLayer.style.top = null;
                helperNumberLayer.style.left = null;
            }

            //prevent error when `this.currentStep` is undefined
            if (!this.introItems[this.currentStep]) return;

            //if we have a custom css class for each step
            currentStepObj = this.introItems[this.currentStep];
            if (typeof(currentStepObj.tooltipClass) === 'string') {
                tooltipCssClass = currentStepObj.tooltipClass || '';
            } else {
                tooltipCssClass = this.options.tooltipClass || '';
            }

            tooltipLayer.className = (tooltipLayer.className + tooltipCssClass).replace(/^\s+|\s+$/g, '');

            //custom css class for tooltip boxes
            var tooltipCssClass = this.options.tooltipClass,
                currentTooltipPosition = this.introItems[this.currentStep].position;
            //TODO 优化成jQuery对象
            switch (currentTooltipPosition) {
                case 'top':
                    tooltipLayer.style.left = '15px';
                    tooltipLayer.style.top = '-' + (this._getOffset($(tooltipLayer)).height + 10) + 'px';
                    arrowLayer.className = 'ui-intro-arrow bottom';
                    break;
                case 'right':
                    tooltipLayer.style.left = (this._getOffset($(targetElement)).width + 20) + 'px';
                    arrowLayer.className = 'ui-intro-arrow left';
                    break;
                case 'left':
                    if (this.options.showStepNumbers == true) {
                        tooltipLayer.style.top = '15px';
                    }
                    tooltipLayer.style.right = (this._getOffset($(targetElement)).width + 20) + 'px';
                    arrowLayer.className = 'ui-intro-arrow right';
                    break;
                case 'floating':
                    arrowLayer.style.display = 'none';

                    //we have to adjust the top and left of layer manually for intro items without element
                    tooltipOffset = this._getOffset($(tooltipLayer));

                    tooltipLayer.style.left = '50%';
                    tooltipLayer.style.top = '50%';
                    tooltipLayer.style.marginLeft = '-' + (tooltipOffset.width / 2) + 'px';
                    tooltipLayer.style.marginTop = '-' + (tooltipOffset.height / 2) + 'px';

                    if (typeof(helperNumberLayer) != 'undefined' && helperNumberLayer != null) {
                        helperNumberLayer.style.left = '-' + ((tooltipOffset.width / 2) + 18) + 'px';
                        helperNumberLayer.style.top = '-' + ((tooltipOffset.height / 2) + 18) + 'px';
                    }

                    break;
                case 'bottom-right-aligned':
                    arrowLayer.className = 'ui-intro-arrow top-right';
                    tooltipLayer.style.right = '0px';
                    tooltipLayer.style.bottom = '-' + (this._getOffset($(tooltipLayer)).height + 10) + 'px';
                    break;
                case 'bottom-middle-aligned':
                    targetElementOffset = this._getOffset(targetElement);
                    tooltipOffset = this._getOffset(tooltipLayer);

                    arrowLayer.className = 'ui-intro-arrow top-middle';
                    tooltipLayer.style.left = (targetElementOffset.width / 2 - tooltipOffset.width / 2) + 'px';
                    tooltipLayer.style.bottom = '-' + (tooltipOffset.height + 10) + 'px';
                    break;
                case 'bottom-left-aligned':
                    // Bottom-left-aligned is the same as the default bottom
                case 'bottom':
                    // Bottom going to follow the default behavior
                default:
                    tooltipLayer.style.bottom = '-' + (this._getOffset($(tooltipLayer)).height + 10) + 'px';
                    arrowLayer.className = 'ui-intro-arrow top';
                    break;
            }
        },
        /**
         * 获取元素的位置
         * @param $el
         * @returns {*}
         * @private
         */
        _getOffset: function($el) {
            var pos = $el.offset();
            return $.extend({}, pos, {
                width: $el.outerWidth(),
                height: $el.outerHeight()
            });
        },
        /**
         * 判断元素是否在视野（window）内
         * @param el
         * @returns {boolean}
         * @private
         */
        _isInViewPort: function(el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                (rect.bottom + 80) <= window.innerHeight && // add 80 to get the text right
                rect.right <= window.innerWidth
            );
        },
        /**
         * 下一步
         * @private
         */
        _nextStep: function() {
            this.direction = 'forward';

            if (typeof(this.currentStep) === 'undefined') {
                this.currentStep = 0;
            } else {
                ++this.currentStep;
            }

            if ((this.introItems.length) <= this.currentStep) {
                this._trigger('complete');
                this._exitIntro();
                return;
            }

            var nextStep = this.introItems[this.currentStep];

            this._trigger('beforeChange', null, nextStep);
            this._showIntro(nextStep);
        },

        /**
         * 上一步
         * @returns {boolean}
         * @private
         */
        _previousStep: function() {
            this.direction = 'backward';

            if (this.currentStep === 0) {
                return false;
            }

            var nextStep = this.introItems[--this.currentStep];
            this._trigger('beforeChange', null, nextStep);
            this._showIntro(nextStep);
        },

        /**
         * 跳转到指定引导页
         * @param step 页码
         * @private
         */
        _goToStep: function(step) {
            this.currentStep = step - 2; //nextStep中会+1，所有这里要减2
            if (typeof(this.introItems) !== 'undefined') {
                this._nextStep();
            }
        },

        _exitIntro: function() {
            //remove overlay layer from the page
            var $el = this.element;
            var $overlay = $el.find('.ui-intro-overlay');

            //return if intro already completed or skipped
            if ($overlay == null || $overlay.length === 0) {
                return;
            }

            //for fade-out animation
            $overlay.css('opacity', 0);
            setTimeout(function() {
                $overlay.remove();
            }, 500);

            //remove all helper
            $el.find('.ui-intro-helper-layer').remove();

            //remove intro floating element
            $el.find('.ui-intro-floating-element').remove();

            //remove `ui-intro-showElement` class from the element
            var showElement = document.querySelector('.ui-intro-show-element');
            if (showElement) {
                showElement.className = showElement.className.replace(/ui-intro-[a-zA-Z]+/g, '').replace(/^\s+|\s+$/g, ''); // This is a manual trim.
            }

            //remove `ui-intro-fixParent` class from the elements
            var fixParents = document.querySelectorAll('.ui-intro-fix-parent');
            if (fixParents && fixParents.length > 0) {
                for (var i = fixParents.length - 1; i >= 0; i--) {
                    fixParents[i].className = fixParents[i].className.replace(/ui-intro-fix-parent/g, '').replace(/^\s+|\s+$/g, '');
                }
            }

            //clean listeners
            if (document.addEventListener) {
                $(window).off('keydown.intro');
            } else {
                $(document).off('resize.intro');
            }

            //set the step to zero
            this.currentStep = undefined;
        },

        /**
         * 启动引导对话框
         * @method start
         * @chainable
         * @return {Object} jQuery Object
         */
        start: function() {
            this._start();
            return this;
        },
        /**
         * 跳转到指定步骤
         * @method goToStep
         * @param {Number} step 转到指定步骤
         * @chainable
         * @return {Object} jQuery Object
         */
        goToStep: function(step) {
            this._goToStep(step);
            return this;
        },
        /**
         * 下一步
         * @method nextStep
         * @chainable
         * @return {Object} jQuery Object
         */
        nextStep: function() {
            this._nextStep();
            return this;
        },
        /**
         * 上一步
         * @method previousStep
         * @chainable
         * @return {Object} jQuery Object
         */
        previousStep: function() {
            this._previousStep();
            return this;
        },

        /**
         * 退出引导
         * @method  exit
         * @chainable
         * @return {Object} jQuery Object
         */
        exit: function() {
            this._exitIntro();
            return this;
        }
    });
}();