$.sidebarMenu = function(menu,callback,callview) {
	"use strict";
	var animationSpeed = 300, subMenuSelector = '.sidebar-submenu';

	$(menu).on('click', 'li a', function(e) {
		var $this = $(this);
		var checkElement = $this.next();
		if (checkElement.is(subMenuSelector)) {
			if (checkElement.is(':visible')) {
				checkElement.slideUp(animationSpeed, function() {
					checkElement.removeClass('menu-open');
				});
				checkElement.parent("li").removeClass("active");
			} else {
				var parent = $this.parents('ul').first();
				var ul = parent.find('ul:visible').slideUp(animationSpeed);
				ul.removeClass('menu-open');
				var parent_li = $this.parent("li");

				checkElement.slideDown(animationSpeed, function() {
					checkElement.addClass('menu-open');
					parent.find('li.active').removeClass('active');
					parent_li.addClass('active');
				});
				
				var menu_child = $this.find("input[name='menu_child']").val() ;
				callview.showSubMenu(menu_child);
				
			}
			e.preventDefault();
		}else{
			//alert($this.attr("menu_url"));
			if($.isFunction(callback)) callback($this,callview);
		}

	});
}
