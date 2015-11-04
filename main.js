$(document).ready(function(){
	var canvas      = document.createElement('canvas'),
        context     = canvas.getContext('2d'),
		img         = $('img#image')[0],
		imgWrapper  = $('div#image-wrapper')[0],
		changes     = [],
		addChange   = true,
		changeIndex,
		lastImage,
		currentImage,
		imgScale, 
		initHeight
        fontStyle = 'Arial';
   
	//input. draw to canvas
	$('input#image-upload').on('change', imgLoad);
    
    function imgLoad (event) {
    	img.src = URL.createObjectURL(event.target.files[0]);
    	
    	img.removeAttribute('height');
    	img.removeAttribute('width');
    	
    	imgScale = 1.00;

    	img.onload = function() {
            initHeight    = this.height;
            canvas.height = this.height;
            canvas.width  = this.width;
            context.drawImage(img, 0, 0, this.width, this.height);
            updateImage.call(this);
            this.onload = updateImage;
    	};

        function updateImage () {
            changeCanvasCallback(canvas, context);
            this.height = canvas.height * imgScale;
            this.width  = canvas.width * imgScale;
        }
	}

	$('button#rectangular-selector').on('click', function (event) {    
		var $this = $(this);
		$this.buttonController();

		if($this.val() === 'ON') {
		    $('div#image-wrapper').on('mousedown', function (event) {
		        var startTop  = event.pageY,
		            startLeft = event.pageX,
		            $box      = $('<div id="selection"></div>'),
		            $wrapper  = $('div#image-wrapper'),
		            offset    = $wrapper.offset(); 

		        $('#selection').remove();
		        $('div#image-wrapper').append($box);

		        $(window).on('mousemove', function (event) {
		            var top    = startTop,
		                left   = startLeft,
		                bottom = event.pageY,
		                right  = event.pageX,
		                height = Math.abs(bottom - top),
		                width  = Math.abs(right - left);

		            event.preventDefault();

		            if (bottom < top) top  = bottom;
		            if (right < left) left = right;

		            $box.css({
		                top: (top - offset.top) + 'px',
		                left: (left - offset.left) + 'px',
		                height: height + 'px',
		                width: width + 'px'
		            })

		        });

		        $(window).one('mouseup', function (event) { 
		            $(window).off('mousemove');
		        });
	   		 });
		}
		else {
			$('div#image-wrapper').off('mousedown');
		}
	});

	$('button#zoom-in').on('click', function (event) {
		var $this = $(this);
		$this.buttonController();


		if ($this.val() === 'ON') {
			$('img#image').on('click', function (event) {	
				var resize   = 1.1,
					mouseX   = event.pageX,
					mouseY   = event.pageY,
					newH     = img.height * resize,
					newW     = img.width * resize,
					imgDiv   = img.parentNode;

				imgScale = newH/initHeight;
				event.preventDefault();

				img.height = newH;
				img.width  = newW;
			});
		}

		else {
			$('img#image').off('click');
		}
	});

	$('button#zoom-out').on('click', function (event) {
		var $this = $(this);
		$this.buttonController();


		if ($this.val() === 'ON') {
			$('img#image').on('click', function (event) {	
				var resize = 0.9,
					mouseX = event.pageX,
					mouseY = event.pageY,
					newH   = img.height * resize,
					newW   = img.width * resize,
					imgDiv = img.parentNode;

				event.preventDefault();

				imgScale = newH/initHeight;

				img.height = newH;
				img.width  = newW;
			});
		}

		else {
			$('img#image').off('click');
		};
	});

	//nav around image 
	$('button#nav').on('click', function (event) {
		var $this = $(this);
		$this.buttonController();

		if ($this.val() === 'ON'){
			$('div#image-wrapper').on('mousedown', function (event) {
				var startX  = event.pageX,
					startY  = event.pageY;
					imgLeft = imgWrapper.offsetLeft,
					imgTop  = imgWrapper.offsetTop;

				event.preventDefault();

				$(window).on('mousemove', function (event) {
					var	clickX   = event.pageX,
						clickY   = event.pageY,
						offsetX  = clickX - startX,
						offsetY  = clickY - startY;

					event.preventDefault();
						
					imgWrapper.style.top  = imgTop + offsetY + 'px';
					imgWrapper.style.left = imgLeft + offsetX + 'px';

				});

				$(window).one('mouseup', function (event) {
					$(window).off('mousemove');
				});
			});
		}

		else {
			$('div#image-wrapper').off('mousedown');
		}

	});

    //crop
    $('button[name="crop-image"]').on('click', function (event) {
        var $selection = $('#selection'),
            position   = $selection.position(),
            height     = $selection.height()/imgScale,
            width      = $selection.width()/imgScale,
            imgData    = context.getImageData(position.left/imgScale, position.top/imgScale, width, height);

        canvas.height = height;
        canvas.width  = width;
        initHeight    = height;

        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
        imgWrapper.style.top = 0 + 'px';
        imgWrapper.style.left = 0 + 'px';
        $selection.remove();
    });

    //rotate clockwise
    $('button#clockwise').on('click', function (event) {
    	var angleInDegrees = 0;

    	angleInDegrees = (angleInDegrees + 90) % 360;
    	drawRotated(angleInDegrees);
    });

    //rotate counter clockwise
    $('button#counter-clockwise').on('click', function (event) {
    	var angleInDegrees = 0;

    	angleInDegrees = (angleInDegrees - 90) % 360;
    	drawRotated(angleInDegrees);
    });

    //write text
	 $('button#text').on('click', function (event) {
	    	var position     = $('#selection').position(),
	    		text         = $('#text-content').val(),
	    		textSize     = $('#text-size').val(),
	    		textColor    = $('#text-color').val();

	    	context.fillStyle = textColor;
	    	context.font = textSize + "px " + fontStyle;
	    	context.textBaseline = 'top';
	    	context.fillText(text, position.left / imgScale, position.top / imgScale);
	    	img.src = canvas.toDataURL();
			
	 });
    //change fonts for text
    $('select#font-style').on('change', function (event) {
        fontStyle = $('input#text-content')[0].style.fontFamily = event.currentTarget.value;
    });
    //canvas layer for painting
    $('button#paint').on('click', function (event){
        var $paintLayer  = $('<canvas id="paint-layer" style="z-index 2"></canvas>'),
            $this        = $(this),
            $wrapper     = $('div#image-wrapper'),
            offset       = $wrapper.offset(),
            coords       = [],
            paintCanvas  = $paintLayer[0],
            paintContext = paintCanvas.getContext('2d');

        paintCanvas.width  = img.width;
        paintCanvas.height = img.height;
        $this.buttonController();
        $wrapper.append($paintLayer);

        if($this.val() === 'ON') {
            $('canvas#paint-layer').on('mousedown', function (event) {
                var x = event.pageX - offset.left,
                    y = event.pageY - offset.top;

                event.preventDefault();
                paint = true;
                coords.push({ x: x, y: y, drag: false });
                reDraw(coords, paintContext);

                $('canvas#paint-layer').on('mousemove', function (event) {
                    var x = event.pageX - offset.left,
                        y = event.pageY - offset.top;
                    if (paint) {
                        coords.push({ x: x, y: y, drag: true });
                        reDraw(coords, paintContext);
                    }
                });
            });

            $('canvas#paint-layer').on('mouseup', function (event) {
                paint = false;

                reDraw(coords, context, imgScale);
                coords = [];
                img.src = canvas.toDataURL();
            });
        }
    });

	$('button#undo').on('click', undo);
    $('button#grayscale').on('click', grayscale);
    $('button#sepia').on('click', sepia);
    $('input#brightness').on('mouseup', brightness);

    function reDraw (coords, ctx, scale) {
        var paintColor = $('#paint-color').val();
            lineSize  = $('#line-size').val();

        ctx.strokeStyle = paintColor;
        ctx.lineJoin    = "round";
        scale           = scale || 1;
        ctx.lineWidth   = lineSize / scale;

        for (var i = 0; i < coords.length; i++) {
            ctx.beginPath();
            if (coords[i].drag && i) {
                ctx.moveTo(coords[i-1].x / scale, coords[i-1].y / scale);
            }
            else {
                ctx.moveTo((coords[i].x-1) / scale, coords[i].y / scale);
            }
            ctx.lineTo(coords[i].x / scale, coords[i].y / scale);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function drawRotated (degrees) {
    	var	temp = canvas.width;

    	canvas.width  = canvas.height;
    	canvas.height = temp;
    	context.save();
    	
    	if (degrees > 0) {
    	 context.translate(canvas.width, 0);
    	}
    	
    	else {
    	context.translate(0, canvas.height);
    	}

    	context.rotate(degrees * Math.PI/180);
    	context.drawImage(img, 0, 0);
    	context.restore();
    	img.src = canvas.toDataURL();   	
    }

    function changeCanvasCallback (canvas, context) { //make undo/redo happen here
		var href = canvas.toDataURL('image/png');
		$('a#save').prop('href', href);
		$('#filename').on('change', function (event) {
			$('a#save').prop('download', $('#filename').val());
		});
		lastImage = currentImage;
        currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
       
        if (addChange) {
        	makeChange();
        }
        else {
        	addChange = true;
        }
	}

	function makeChange () {
		var change 		 = {};

		currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
		change.diffs = [];
		if (!lastImage) return;
		for (var i = 0; i < currentImage.data.length; i++){
			if (currentImage.data[i] != lastImage.data[i]) {
				diff = currentImage.data[i] - lastImage.data[i];
				change.diffs.push([i, diff]);
			}
		}
		changes.push(change);
		changeIndex = changes.length - 1;
	}

    function grayscale () {
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height),
            r, g, b, average;

        for (var i = 0; i < imgData.data.length; i+=4) {
            r = imgData.data[i];
            g = imgData.data[i+1];
            b = imgData.data[i+2];
            average = (r + g + b) / 3;

            imgData.data[i]   = average;
            imgData.data[i+1] = average;
            imgData.data[i+2] = average;
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

    function sepia () {
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height),
            r, g, b;

        for (var i = 0; i < imgData.data.length; i+=4) {
            r = imgData.data[i];
            g = imgData.data[i+1];
            b = imgData.data[i+2];

            imgData.data[i]   = (r * 0.393)+(g * 0.769)+(b * 0.189);
            imgData.data[i+1] = (r * 0.349)+(g * 0.686)+(b * 0.168);
            imgData.data[i+2] = (r * 0.272)+(g * 0.534)+(b * 0.131);
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

    function brightness (event) {
        var $range = $(event.currentTarget),
            adjusts = $range.val(),
            imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < imgData.data.length; i+=4) {
            imgData.data[i]   += adjusts;
            imgData.data[i+1] += adjusts;
            imgData.data[i+2] += adjusts;
        }
        context.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL();
    }

	function undo () {
		var change = changes[changeIndex];
		console.log('start');

		for (var i = 0; i < change.diffs.length; i++){
			var index = change.diffs[i][0],
				diff  = change.diffs[i][1];
			currentImage.data[index] = currentImage.data[index] - diff;
		}
		
		console.log('done');
		context.putImageData(currentImage, 0 , 0); 
		changeIndex--;
		addChange = false;
		img.src = canvas.toDataURL();
	}

	$.fn.buttonController = function () { //refactor with a variable that holds the last button pressed and turn it and only it off  
		var $rectSelect = $('button#rectangular-selector'),
			$zoomIn     = $('button#zoom-in'),
			$zoomOut    = $('button#zoom-out'),
			$nav        = $('button#nav'),
			$paint  	= $('button#paint');	

		if (this.val() === 'OFF') {
			
			$rectSelect.val('OFF');
			$rectSelect.removeClass('btn btn-success').addClass('btn btn-danger');
			$('div#image-wrapper').off('mousedown');

			$zoomIn.val('OFF');
			$zoomIn.removeClass('btn btn-success').addClass('btn btn-danger');
			$('img#image').off('click');

			$zoomOut.val('OFF');
			$zoomOut.removeClass('btn btn-success').addClass('btn btn-danger');
			$('img#image').off('click');

			$nav.val('OFF');
			$nav.removeClass('btn btn-success').addClass('btn btn-danger');
			$('div#image-wrapper').off('mousedown');

            $paint.val('OFF');
            $paint.removeClass('btn btn-success').addClass('btn btn-danger');
            $('img#image').off('click');
            $('canvas#paint-layer').off('mousedown');
            $('canvas#paint-layer').off('mousemove');
            $('canvas#paint-layer').remove();

			this.val('ON');
			this.removeClass('btn btn-danger').addClass('btn btn-success');
        }

		else {
			this.val('OFF');
			this.removeClass('btn btn-success').addClass('btn btn-danger');
            $('canvas#paint-layer').remove();
		}
	}
});