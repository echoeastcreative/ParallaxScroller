/**
 * Parallax Scroller
 * 
 * @uses jQuery 1.5
 * @author Doug Hurst <dalan.hurst@gmail.com>
 */

/**
 * Constructor
 */
ParallaxScroller = function() {
	$(window).scroll($.proxy(function(event) { this.parallax(event); }, this));
};

/** @var array All layers in the parallax */
ParallaxScroller.prototype.layers = [];

/**
 * Get Background Image Height
 * 
 * @param string an image URL
 * @return int
 */
ParallaxScroller.prototype.getBackgroundImageHeight = function(url) {
	if(url.indexOf('url(') !== -1) url = url.replace(/url\("/, '').replace(/"\)/, '');
	var img = $('<img />');
	img.hide();
	img.attr('src', url);
	$('body').append(img);
	return $(img).height();
};

/**
 * Sets a layer to be scrolled in parallax with other layers
 * 
 * @param string layer_selector CSS Selector for designated segments of the layer
 * @param float speed Multiplier for parallaxing speed & direction
 * @param string type One of 'background' or 'element'
 * @param int algorithm Algorithm number to use
 * @return this Provides fluent interface
 */
ParallaxScroller.prototype.addLayer = function(layer_selector, speed, type, algorithm) {
	var segments = [];
	if(typeof(type) === 'undefined') type = 'element';
	if(typeof(algorithm) === 'undefined') algorithm = 1;

	//  Add segments to array
	$(layer_selector).each($.proxy(function(index) {

		//  Handle background segments
		//  These will be parallaxed by offsetting background-position
		//  NOTE: The x-value of th background position *must* be in pixels
		if(type == 'background' && $($(layer_selector)[index]).css('background-image') != 'none') {
			left = $($(layer_selector)[index])
				.css('background-position')
				.substr(
						0,
						$($(layer_selector)[index])
							.css('background-position')
							.indexOf(' ')
				);
			if(left.indexOf('px') == -1) left = '0';
			else left = left.replace('px', '');
			if(speed < 0 ) top = -1 * (this.getBackgroundImageHeight($($(layer_selector)[index]).css('background-image')) - $(window).height());
			else top = $($(layer_selector)[index]).offset().top * speed * -1;

			$($(layer_selector)[index])
				.css('background-repeat', 'no-repeat')
				.css('background-position', left + 'px ' + top + 'px')
				.css('height', $(window).height() + 'px');

			segments[segments.length] = {
					element: $(layer_selector)[index],
					background_start: {left: left, top: top},
					starting_offset: $($(layer_selector)[index]).offset(),
					type: type
			};
		}

		//  Handle element segments
		if(type == 'element') {
			segments[segments.length] = {
					element: $(layer_selector)[index],
					element_start: $($(layer_selector)[index]).offset(),
					starting_offset: $($(layer_selector)[index].parentNode).offset(),
					type: type
			};
		}
	}, this));

	//  Create layer
	var layer = {
		algorithm: algorithm,
		segments: segments,
		selector: layer_selector,
		speed: speed
	};
	this.layers[this.layers.length] = layer;

	return this;
};

/**
 * Parallax Event Handler
 * 
 * @param event The scroll event
 */
ParallaxScroller.prototype.parallax = function(event) {
	scroll_top = $(window).scrollTop();

	//  Loop through layers
	for(i in this.layers) {

		//  Loop through layer segments
		for(j = 0; j < this.layers[i].segments.length; j++) {
			vertical_offset = Math.floor((this.layers[i].segments[j].starting_offset.top - scroll_top) * this.layers[i].speed);

			//  Calculate Offset
//			switch(this.layers[i].algorithm) {
//				case 1:
//					//  Algorithm 1
//					//  Ensure that when scroll_top == starting_offset.top, the element is vertically centered within it's parent node
//					vertical_offset = Math.floor((this.layers[i].segments[j].starting_offset.top - scroll_top) * this.layers[i].speed)
//									+ $(this.layers[i].segments[j].element.parentNode).offset().top
//									+ Math.floor($(this.layers[i].segments[j].element.parentNode).height() / 2)
//									- Math.floor($(this.layers[i].segments[j].element).height() / 2);
//					break;
//				case 2:
//					//  Algorithm 2
//					//  Ensure that when scroll_top == starting_offset.top, the element is in it's original position
//					vertical_offset = Math.floor((this.layers[i].segments[j].starting_offset.top - scroll_top) * this.layers[i].speed);
//					break;
//				case 3:
//					//  Algorithm 3
//					//  Ensure that when scroll_top == 0, the element is in it's original position
//					vertical_offset = Math.floor((this.layers[i].segments[j].starting_offset.top - scroll_top) * this.layers[i].speed);
//					break;
//			}

			//  Set offset
			switch(this.layers[i].segments[j].type) {
				case 'background':
					if(this.layers[i].speed < 0) top = this.layers[i].segments[j].background_start.top + vertical_offset;
					else top = -1 * vertical_offset;

//					console.log({
//						vertical_offset: vertical_offset,
//						top: top,
//						scroll_top: scroll_top,
//						background_start: this.layers[i].segments[j].background_start.top,
//						starting_top: this.layers[i].segments[j].starting_offset.top
//					});

					$(this.layers[i].segments[j].element)
						.css('background-position', this.layers[i].segments[j].background_start.left + 'px ' + top + 'px');
					break;
				default:
					if(this.layers[i].speed < 0) top = this.layers[i].segments[j].element_start.top - vertical_offset;
					else top = this.layers[i].segments[j].element_start.top - vertical_offset;

//					console.log({
//						vertical_offset: vertical_offset,
//						top: top,
//						scroll_top: scroll_top,
//						element_start: this.layers[i].segments[j].element_start.top,
//						starting_top: this.layers[i].segments[j].starting_offset.top
//					});

					$(this.layers[i].segments[j].element).offset({
						top: top,
						left: this.layers[i].segments[j].starting_offset.left
					});
					break;
			}
		}
	}
};
