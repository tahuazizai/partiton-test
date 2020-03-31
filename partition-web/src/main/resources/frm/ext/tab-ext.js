!function(){
	"use strict";

    $.widget("ui.tabs", $.ui.tabs, {
        options: {
            templateArr: ["<li><a href='#{href}'><button type='button' class='ui-tabs-close close' role='button'><span aria-hidden='true' title='close'>&times;<span class='sr-only'>Close</span></span></button>#{label}</a></li>",
                "<li><a href='#{href}'>#{label}<button type='button' class='ui-tabs-close ui-tabs-main-close close' role='button'><span aria-hidden='true' title='close' class='glyphicon glyphicon-remove-sign'></span></button></a></li>"
            ],
            tabwarp: false // 是否开启自定义tab列头功能，默认为false
        },
        /*
        {
        	templateArr:["<li><a href='#{href}'><button type='button' class='ui-tabs-close close' role='button'><span aria-hidden='true' title='close'>&times;<span class='sr-only'>Close</span></span></button>#{label}</a></li>",
        	             "<li><a href='#{href}'><button type='button' class='ui-tabs-close ui-tabs-main-close close' role='button'><span aria-hidden='true' title='close' class='iconfont icon-close'></span></button>#{label}</a></li>"]
        },
         */
       _processTabs: function () {
            var that = this,
                prevTabs = this.tabs,
                prevAnchors = this.anchors,
                prevPanels = this.panels;

            this.tablist = this._getList()
                .attr("role", "tablist")

                // Prevent users from focusing disabled tabs via click
                .delegate("> li", "mousedown" + this.eventNamespace, function (event) {
                    if ($(this).is(".ui-state-disabled")) {
                        event.preventDefault();
                    }
                })

                // support: IE <9
                // Preventing the default action in mousedown doesn't prevent IE
                // from focusing the element, so if the anchor gets focused, blur.
                // We don't have to worry about focusing the previously focused
                // element since clicking on a non-focusable element should focus
                // the body anyway.
                .delegate(".ui-tabs-anchor", "focus" + this.eventNamespace, function () {
                    if ($(this).closest("li").is(".ui-state-disabled")) {
                        this.blur();
                    }
                });

            if (this.options.tabwarp && !this.tablist.parent("div").hasClass('ui-tabs')) {
                this.tablistContainer = this.tablist.parent("div").addClass("ui-tabs-nav");
            } else {
                this.tablist.addClass('ui-tabs-nav');
            }

            this.lastTablistWidth = this.tablist.width();

            this.tabs = this.tablist.find("> li:has(a)").not('.ui-tabs-paging-prev,.ui-tabs-paging-next') //:has(a[href])
                .addClass("ui-state-default")
                .attr({
                    role: "tab",
                    tabIndex: -1
                });

            this._visibleTabs = this.tabs.filter(function(index, el) {
                return !$(el).hasClass('ui-tabs-hidden');
            });

            this.anchors = this.tabs.map(function () {
                    return $("a", this)[0];
                })
                .addClass("ui-tabs-anchor")
                .attr({
                    role: "presentation",
                    tabIndex: -1
                });

            this.panels = $();

            this.anchors.each(function (i, anchor) {
                var selector, panel, panelId,
                    anchorId = $(anchor).uniqueId().attr("id"),
                    tab = $(anchor).closest("li"),
                    originalAriaControls = tab.attr("aria-controls");

                // inline tab
                if (that._isLocal(anchor)) {
                    selector = anchor.hash;
                    panelId = selector.substring(1);
                    panel = that.element.find(that._sanitizeSelector(selector));
                } else { //没有hash的时候,
                	//修改获取TAB逻辑：改为查找有指定class的div而不是获取子元素
                    panel = that.element.children().siblings("div.ui-tabs-panel:eq(" + i + ")");
                    panelId = panel.attr("id");
                    if (!panelId) {
                        panelId = tab.attr("aria-controls") || $({}).uniqueId()[0].id;
                        panel.attr("id", panelId);
                    }
                    selector = "#" + panelId;
                    $(anchor).attr("href", selector);
                    panel.attr("aria-live", "polite");
                }

                if (panel.length) {
                    that.panels = that.panels.add(panel);
                }
                if (originalAriaControls) {
                    tab.data("ui-tabs-aria-controls", originalAriaControls);
                }
                tab.attr({
                    "aria-controls": panelId,
                    "aria-labelledby": anchorId
                });
                panel.attr("aria-labelledby", anchorId);
            });

            this.panels
                .addClass("ui-tabs-panel")
                .attr("role", "tabpanel");

            // Avoid memory leaks (#10056)
            if (prevTabs) {
                this._off(prevTabs.not(this.tabs));
                this._off(prevAnchors.not(this.anchors));
                this._off(prevPanels.not(this.panels));
            }
            if (this.options.fixedHeight) {
                this.panels.addClass('ui-tabs-panel-absolute');
            }

        },
        _getList: function () {
        	//修改获取UL逻辑：改为搜索UL而不是必定取子元素
            return this.tablist || this.element.find("ol,ul").eq(0);
        },
        _create: function() {
            var options = this.options;
            if (!options.style || !_.isFinite(options.style)) {
                options.style = 1;
            }
            //修改tab多处一栏后左右按钮的样式
            if (options.paging) {
                options.paging = {
                    nextButton  : '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>',
                    prevButton  : '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'
                }
            }
			options.tabCanCloseTemplate = options.templateArr[parseInt(options.style,10)];

			this._super();
		},
		add: function (o) {
			var id = o.id;
			id || $({}).uniqueId()[0].id;
			this._super(o);
//			this.element.find("#"+o.id).removeClass("page-tabs-noborder page-tabs-default page-tabs-compact");
//			if(o.noborder == 'noborder' || o.noborder == 'true'){
//				this.element.find("#"+o.id).addClass("page-tabs-noborder");
//			}else if(o.noborder == 'compact'){
//				this.element.find("#"+o.id).addClass("page-tabs-compact");
//			}else{
//				this.element.find("#"+o.id).addClass("page-tabs-default");
//			}
		}
	});
}();