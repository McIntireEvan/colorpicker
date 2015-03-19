(function ($) {
    $.fn.colorwheel = function(options) {
        return this.each(function() {
            var element = $(this);
            var options = $.extend({
                size: 500,
                ringSize: 50,
                color: 180,
                onInput: function(evt) {}
            }, options);

            var radius = x = y = options.size / 2;
            var length = Math.sqrt(2 * Math.pow(radius - options.ringSize, 2));
            var half = length / 2;
            var can = $('<canvas>').attr({
                width: options.size,
                height: options.size,
                id: 'colorwheel'
            });

            var ctx = can.get(0).getContext('2d');

            var outer = $('<div/>').addClass('colorwheel-outer').css({
                width: options.ringSize,
                height: options.ringSize
            });

            var inner = $('<div/>').addClass('colorwheel-inner');
            element.append(outer).append(inner).append(can);

            var focusOut = false, focusIn = false;
            console.log(element);
            $('#colorwheel, .colorwheel-outer, .colorwheel-inner').on('mousedown', function (evt) {
                evt.preventDefault();
                var parentOffset = can.parent().offset();
                var eX = evt.pageX - parentOffset.left;
                var eY = evt.pageY - parentOffset.top;
                var dist = Math.sqrt(Math.pow(x -eX, 2) + Math.pow(y - eY, 2));
                if (dist < radius && dist > radius - options.ringSize) {
                    focusOut = true;
                    updateOuter(evt);
                } else if (dist < radius - options.ringSize) {
                    focusIn = true;
                    updateInner(evt);
                }
            });

            $(document).on('mouseup', function (evt) {
                focusOut = focusIn = false;
            }).on('mousemove', function (evt) {
                if (focusOut) {
                    updateOuter(evt);
                } else if (focusIn) {
                    updateInner(evt);
                }
            });
            var updateOuter = function(evt) {
                var rawAngle = Math.atan2(evt.pageY - y, evt.pageX - x), angle = rawAngle * 180 / Math.PI;
                if (rawAngle < 0) {
                    angle = 360 - (angle * -1);
                }

                var middle = radius - ((options.ringSize) / 2);
                outer.css({
                    left: Math.cos(rawAngle) * middle + x - (options.ringSize / 2) + 5,
                    top: Math.sin(rawAngle) * middle + y - (options.ringSize / 2) + 5
                });
                options.color = Math.round(angle);
                renderInner();
            };

            var updateInner = function(evt) {
                var offset = getRelativePos(can, evt);
                var xDiff = Math.abs(x - offset.x);
                var yDiff = Math.abs(y - offset.y);
                var dist = Math.sqrt(Math.pow(x - offset.x, 2) + Math.pow(y - offset.y, 2));
                if (dist < radius - options.ringSize && xDiff < half && yDiff < half) {
                    inner.css({
                        left: evt.pageX -5,
                        top: evt.pageY - 5
                    });
                }
            };

            var renderOuter = function() {
                for (var i = 0; i < 360; i++) {
                    ctx.beginPath();
                    ctx.fillStyle = 'hsl(' + i + ', 100%, 50%)';
                    ctx.moveTo(x, y);
                    ctx.arc(x, y, radius, (i - 2) * (Math.PI / 180), (i * (Math.PI / 180)), false);
                    ctx.lineTo(x, y);  
                    ctx.fill();
                }
                //Draw white to hide the center area
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.moveTo(x, y);
                ctx.arc(x, y, radius - options.ringSize, 0, 2 * Math.PI, false);
                ctx.fill();
            };
    
            var renderInner = function() {
                ctx.lineWidth = 1;
                ctx.strokeRect(x - half + 2, y - half + 2, length - 2, length - 2);

                for (var i = 0; i < 100; i++) {
                    var line = ctx.createLinearGradient(
                        x - half + 2,
                        (y - half) + 2 + ((i * (length - 3)) / 100),
                        length - 2,
                        1 + (length - 2) / 100
                    )
                    var sat = 100 - i
                    line.addColorStop(0, 'hsl(' + options.color + ',' + 100 + '%,' + sat + '%)');
                    line.addColorStop(.5, 'hsl(' + options.color + ',' + sat + '%,' + sat + '%)');
                    line.addColorStop(1, 'hsl(' + options.color + ',' + 0 + '%,' + sat + '%)');
                    ctx.fillStyle = line;
                    ctx.fillRect(
                        x - half + 2,
                        (y - half) + 2 + ((i * (length - 3)) / 100),
                        length - 2,
                        (length - 2) / 100
                    );
                };
            };

            var getColor = function() {
                var x = inner.position().left + 15;
                var y = inner.position().top + 15;
                var c = ctx.getImageData(x, y, 1, 1).data;
                return {'r':c[0], 'g':c[1], 'b':c[2]};
            }
            var getRelativePos = function (element, evt) {
                var parentOffset = $(element).offset();
                var eX = evt.pageX - parentOffset.left;
                var eY = evt.pageY - parentOffset.top;
                return {x: eX, y: eY};
            }
            renderOuter();
            renderInner();

            return this;
        });
    }
})(jQuery);
