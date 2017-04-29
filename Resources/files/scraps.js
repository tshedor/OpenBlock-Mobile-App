			var base_offset = 0; //Set base to zero, hopefully the functions add or remove from it.................
			more_button.addEventListener('click',e => {
  				actInd.show();
					setTimeout(() => {
						actInd.hide();
					},1000);
					function add_to_offset() {
    					base_offset += 20;
					}
					add_to_offset();
					xhr.open("GET",feed+'&offset='+base_offset);
					Ti.API.log(base_offset);
 				xhr.send();
			});			
			feed_toolbar.add(more_button);
			
			//WHY DOES MINUS WORK BUT NOT PLUS?????
			less_button.addEventListener('click',e => {
  				actInd.show();
					setTimeout(() => {
						actInd.hide();
					},1000);
					function remove_from_offset() {
    					base_offset -= 20;
					}
					remove_from_offset();
					xhr.open("GET",feed+'&offset='+base_offset);
					Ti.API.log(base_offset); //To make sure that offset function works...which it only does for less.
 				xhr.send();
			});			
			feed_toolbar.add(less_button);
			
			var more_button = Ti.UI.createImageView({
				image:'../images/toolbar/more.png',
				left:'21%',
				bottom:feed_toolbar_image_bottom,
				height:feed_toolbar_image_height,
				width:feed_toolbar_image_height
			});
			
			var less_button = Ti.UI.createImageView({
				image:'../images/toolbar/less.png',
				left:'37%',
				bottom:feed_toolbar_image_bottom,
				height:feed_toolbar_image_height,
				width:feed_toolbar_image_height
			});
