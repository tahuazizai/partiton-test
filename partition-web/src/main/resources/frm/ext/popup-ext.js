!function () {
    var OPENED_MODAL_CLASS = 'modal-open',
        openedWindows = fish.modalStack.openedWindows,
        DEFAULTS = {
            content: '',
            modal: true,
            keyboard: true,
            draggable: true,
            resizable: false,
            autoDismiss: false,
            canClose: true,
            destroyOnClose: true,
            autoResizable: true,
            width: 'auto',
            height: "auto",
            position: {
                my: "center",
                at: "center",
                of: window,
                collision: "fit",
                // ensure that the titlebar is never outside the document
                using: function (pos) {
                    var topOffset = $(this).css(pos).offset().top;
                    if (topOffset < 0) {
                        $(this).css("top", pos.top - topOffset);
                    }
                }
            }
        },
        KEYCODE = $.ui.keyCode;

    function removeModalWindow(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance).value,
            $body = $(document.body);

        openedWindows.remove(modalInstance);

        $(window).off('resize.' + modalWindow.popupId);

        //remove window DOM element
        modalWindow.$modalElement.off('.data-api');
        modalWindow.$modalElement.remove();

        var hasModalWin = false, opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
            var win = openedWindows.get(opened[i]);
            if (win.value.$modalElement.is(':visible') && win.value.modal) {
                hasModalWin = true;
                break;
            }
        }
        $body.toggleClass(OPENED_MODAL_CLASS, hasModalWin);

        fish.modalStack.removeBackdrop();
    }

    // #553
    //判断是否需要修改遮罩层逻辑
    //①非模态窗口不修改
    //②模态窗口则修改
    function changeBackdrop(modalInstance) {
        var modalWin = openedWindows.get(modalInstance);
        if (!modalWin.value.modal) {
            return;
        }

        var topModalInstance, opened = openedWindows.keys();
        for (var i = opened.length - 1; i >= 0; i--) {
            var win = openedWindows.get(opened[i]);
            if (win.value.$modalElement.is(':visible') && win.value.modal) {
                topModalInstance = opened[i]; // 最上面的的模态窗口
                break;
            }
        }

        fish.modalStack.changeBackdrop(topModalInstance);

        $('body').toggleClass('modal-open', topModalInstance != null);
    }

    function modalOpenerFocus(modalWindow) {
        //如果modalOpener元素不存在，则指向body
        //IE8下，如果modalOpener元素不可见，则调用focus方法报错
        //由于元素不可见（隐藏or删除or父元素隐藏...）不好判断，
        //故暂时IE8下模态对话框关闭后modalOpener元素不做focus处理
        if (modalWindow.value.modalOpener && (!fish.browser.msie || fish.browser.version > 8)) {
            modalWindow.value.modalOpener.focus();
        } else {
            $('body').focus();
        }
    }

    var modalStack = {
        open: function (modalInstance, options) {
            var modalOpener = document.activeElement,
                $body = $(document.body),
                $modalElement, cssOptions, $modalBody, $modalHeader;

            var popupId = fish.uniqueId('ui-popup-');
            openedWindows.add(modalInstance, {
                popupId: popupId,
                deferred: options.deferred,
                modal: options.modal,
                keyboard: options.keyboard
            });

            fish.modalStack.addBackdrop();

            if (options.modal) {
                $body.addClass(OPENED_MODAL_CLASS);
            }

            $modalElement = $(options.content);
            $modalBody = $modalElement.find('.modal-body');
            $modalHeader = $modalElement.find('.modal-header');

            //#577
            if (options.canClose === true) {
                if ($modalHeader.find('.close').length === 0) {
                    $modalHeader.prepend(
                        '<button type="button" class="close" ' + ( options.destroyOnClose ? "data-dismiss" : "data-hide") + ' aria-label="Close"> ' +
                        '<span aria-hidden="true" class="glyphicon glyphicon-remove"></span>' +
                        '</button>');
                }
            }

            $modalElement
                .on('click.dismiss.data-api', '[data-dismiss]', function (e) {
                    modalStack.dismiss(modalInstance, 'dismiss click');
                })
                .on('click.close.data-api', '[data-close]', function (e) {
                    modalStack.close(modalInstance, 'close click');
                })
                .on('click.hide.data-api', '[data-hide]', function (e) {
                    modalStack.hide(modalInstance);
                });

            cssOptions = {
                'z-index': 1050 + (openedWindows.length() - 1) * 10,
                'display': 'block'
            };

            if (options.width !== 'auto') {
                cssOptions.width = options.width;
            }

            if (options.height !== 'auto') {
                if (isNaN(options.height)) {
                    cssOptions.height = Number(options.height.substr(0, options.height.length - 1)) / 100 * $(window).height();
                } else {
                    cssOptions.height = options.height;
                }
            }

            $modalElement.css(cssOptions);
            $body.append($modalElement);

            if (options.height !== 'auto') {
                $modalBody.css('overflow', 'auto');
                $modalBody.outerHeight($modalElement.height() - $modalHeader.outerHeight()
                    - $modalElement.find('.modal-footer').outerHeight());
            }

            $modalElement.position(options.position).data('position', options.position); // store position
            $modalElement.find('[autofocus]').focus();

            if (options.draggable) {
                $modalElement.draggable({
                    handle: ".modal-header",
                    containment: "document",
                    //#578, 如果被拖动了，则不需要进行居中
                    stop: function (event, ui) {
                        $(this).data('new-position', true);
                    }
                });
            }

            if (options.resizable) {
                $modalElement.css('position', 'absolute');
                $modalElement.resizable({
                	//FIX:不联动变化model-body大小避免宽度计算偏差
                    //alsoResize: $modalBody
                });
            }
            //#578
            if (options.autoResizable) {
                $(window).on('resize.' + popupId, fish.debounce(function () {
                	//FIX：让resize事件触发的时候，会自动调整高度（若高度是用百分比配置，且没有开启可手动调整大小功能）
                	//如果允许手动调整大小时触发此操作，会导致竖直方向被锁定，考虑是否改写
                    if(typeof options.height === "string" && options.height.indexOf('%') >= 0
                    		&& !options.resizable){
                    	$modalElement.css('height',Number(options.height.substr(0, options.height.length - 1)) / 100 * $(window).height()+"px");
                    	$modalBody.outerHeight($modalElement.height() - $modalHeader.outerHeight()
                    			- $modalElement.find('.modal-footer').outerHeight());
                    }
                    
                    if (!$modalElement.data('new-position')) {
                        $modalElement.is(':visible') && $modalElement.position($modalElement.data('position'));
                    }
                }, 300));
            }

            openedWindows.top().value.$modalElement = $modalElement;
            openedWindows.top().value.modalOpener = modalOpener;
        },

        close: function (modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                removeModalWindow(modalInstance);
                modalOpenerFocus(modalWindow);
                modalWindow.value.deferred.resolve(result);
                return true;
            }
            return !modalWindow;

        },

        dismiss: function (modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                removeModalWindow(modalInstance);
                modalOpenerFocus(modalWindow);
                modalWindow.value.deferred.reject(reason);
                return true;
            }
            return !modalWindow;
        },

        show: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                modalWin.value.$modalElement.show();
                changeBackdrop(modalInstance);
            }
        },

        hide: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                modalWin.value.$modalElement.hide();
                changeBackdrop(modalInstance);
            }
        },

        isOpen: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                return modalWin.value.$modalElement.is(':visible');
            }
            return false;
        },

        isDestroy: function (modalInstance) {
            return !openedWindows.get(modalInstance);
        },

        center: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                modalWin.value.$modalElement.position({
                    my: "center",
                    at: "center",
                    of: window,
                    collision: "fit"
                });
            }
        }
    };

    $(document).on('keydown', function (evt) {
        var modal;

        if (evt.keyCode === KEYCODE.ESCAPE) {
            modal = openedWindows.top();
            if (modal && modal.value.keyboard) {
                evt.preventDefault();
                modalStack.dismiss(modal.key, 'escape key press');
            }
        }
    });

    fish.popup = function (options) {
        var modalResultDeferred = $.Deferred();

        var modalInstance = {
            result: modalResultDeferred.promise(),
            close: function (result) {
                return modalStack.close(modalInstance, result);
            },
            dismiss: function (reason) {
                return modalStack.dismiss(modalInstance, reason);
            },
            //#553
            show: function () {
                modalStack.show(modalInstance);
            },
            hide: function () {
                modalStack.hide(modalInstance);
            },
            isOpen: function () {
                return modalStack.isOpen(modalInstance);
            },
            isDestroy: function () {
                return modalStack.isDestroy(modalInstance);
            },
            center: function () {
                modalStack.center(modalInstance);
            }
        };

        function dismiss(e) {
            if (!$.contains(openedWindows.get(modalInstance).value.$modalElement[0], e.target)) {
                modalInstance.dismiss('click outside');
            }
        }

        modalStack.open(modalInstance, $.extend({
            deferred: modalResultDeferred
        }, DEFAULTS, options));

        if (options.autoDismiss) {
            fish.defer(function () {
                $(document).on('click', dismiss);
            });
            modalInstance.result.always(function () {
                $(document).off('click', dismiss);
            });
        }

        return modalInstance;
    };
}();