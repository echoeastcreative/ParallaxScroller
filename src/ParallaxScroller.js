/**
 * Parallax Scroller
 * 
 * @uses jQuery 1.5
 * @author Doug Hurst <doug@echoeastcreative.com>
 */

/**
 * Constructor
 */
ParallaxScroller = function() {
	$(window).scroll($.proxy(function(event) { this.parallax(event); }, this));
	this.viewport_height = $(window).height();
};

/** @var array All layers in the parallax */
ParallaxScroller.prototype.layers = [];

/** @var int Height of viewport in pixels */
ParallaxScroller.prototype.viewport_height = 0;

/**
 * Get Background Image Height
 * 
 * @param string an image URL
 * @return int
 */
ParallaxScroller.prototype.getBackgroundImageHeight = function(url) {
	if(url.indexOf('url(') !== -1) url = url.replace(/url\(/, '').replace(/\)/, '');
	if(url.indexOf('"') !== -1) url = url.replace(/"/g, '');
	var img = $('<img />');
	img.hide().attr('src', url);
	$('body').append(img);
	return $(img).height();
};

/**
 * Sets a layer to be scrolled in parallax with other layers
 * 
 * @param string layer_selector CSS Selector for designated segments of the layer
 * @param float speed Multiplier for speed & direction
 * @param string type One of 'background' or 'element'
 * @return this Provides fluent interface
 */
ParallaxScroller.prototype.addLayer = function(layer_selector, speed, type) {
	var segments = [];
	if(typeof(type) === 'undefined') type = 'element';

	//  Add segments to array
	$(layer_selector).each(function(index) {
		var self = $(this);

		//  Handle background segments
		//  These will be in parallax by background-position offset
		//  NOTE: If set, the x-value of the background position *must* be in pixels
		if(type == 'background' && self.css('background-image') != 'none') {
			var container = self;

			//  Calculate starting left value for background image
			var left = self
				.css('background-position')
				.substr(0, self.css('background-position').indexOf(' '));
			if(left.indexOf('px') == -1) left = '0';
			else left = left.replace('px', '');

			//  Calculate starting top value for background image
			var top = 0;
			if(speed < 0 ) top = -1 * (this.getBackgroundImageHeight(self.css('background-image')) - $(window).height());
			else top = self.offset().top * speed * -1;

			var self_start = {left: left, top: top};

			//  Set starting values & set segment height to DOMWindow height
			self
				.css('background-repeat', 'no-repeat')
				.css('background-position', left + 'px ' + top + 'px')
				.css('height', $(window).height() + 'px');
			$(window).bind('scroll', self.ParallaxBackgroundImage);
		}

		//  Handle element segments
		if(type == 'element') {
			var container = $(this.parentNode);
			var self_start = self.offset();
		}

		segments[segments.length] = {
				container: container,
				element: self,
				self_start: self_start,
				starting_offset: container.offset(),
				type: type
		};
	});

	//  Create layer
	var layer = {
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
	var distance = $(window).scrollTop();

	//  Loop through layers
	for(i in this.layers) {
		var layer = this.layers[i];

		//  Loop through layer segments
		for(j = 0; j < layer.segments.length; j++) {
			var segment = layer.segments[j];
			var vertical_offset = Math.floor((segment.starting_offset.top - distance) * layer.speed);

			//  Set offset
			switch(segment.type) {
				case 'background':
					var top;
					if(layer.speed < 0) top = segment.self_start.top + vertical_offset;
					else top = -1 * vertical_offset;
					$(segment.element)
						.css('background-position', segment.self_start.left + 'px ' + top + 'px');
					break;
				default:
					if(layer.speed < 0) top = segment.self_start.top - vertical_offset;
					else top = segment.self_start.top - vertical_offset;
					$(segment.element).offset({
						top: top,
						left: segment.self_start.left
					});
					break;
			}
		}
	}
};
