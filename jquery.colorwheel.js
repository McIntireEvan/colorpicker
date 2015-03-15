$.widget('colorwheel.colorwheel', {
    options: {
        size: 200,
        ringSize: 30,
        color: 180
    },
    _create: function () {
        this.radius = this.options.size / 2;
        var can = $('<canvas>').attr({
            width: this.options.size,
            height: this.options.size,
            id: 'colorwheel'
        });

        var outer = $('<div/>').addClass('colorwheel-outer').css({
            width: this.options.ringSize,
            height: this.options.ringSize
        });

        var inner = $('<div/>').addClass('colorwheel-inner');

        this.element.append(outer).append(inner).append(can);

        ctx = can.get(0).getContext('2d');
        x = y = this.radius;
        focusOut = focusIn = false;
        
        //Initialize outer wheel
        for (var i = 0; i < 360; i++) {
            ctx.beginPath();
            ctx.fillStyle = 'hsl(' + i + ', 100%, 50%)';
            ctx.moveTo(x, y);
            ctx.arc(x, y, this.radius, (i - 2) * (Math.PI / 180), (i * (Math.PI / 180)), false);
            ctx.lineTo(x, y);  
            ctx.fill();
        }
        //Draw white to hide the center area
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.moveTo(x, y);
        ctx.arc(x, y, this.radius - this.options.ringSize, 0, 2 * Math.PI, false);
        ctx.fill();
        var _this = this;
        var length = Math.sqrt(2 * Math.pow(_this.radius - _this.options.ringSize, 2));
        var renderInner = function() {
            //Draw inner box
            var half = length / 2;
            ctx.lineWidth = 1;
            ctx.strokeRect(x - half + 2, y - half + 2, length - 2, length - 2);

            for (var i = 0; i < 100; i++) {
                var line = ctx.createLinearGradient(
                    x - half + 2,
                    (y - half) + 2 + ((i * (length - 3)) / 100),
                    length - 2,
                    1 + (length - 2) / 100
                );
                var sat = 100 - i
                line.addColorStop(0, 'hsl(' + _this.options.color + ',' + 100 + '%,' + sat + '%)');
                line.addColorStop(.5, 'hsl(' + _this.options.color + ',' + sat + '%,' + sat + '%)');
                line.addColorStop(1, 'hsl(' + _this.options.color + ',' + 0 + '%,' + sat + '%)');
                ctx.fillStyle = line;
                ctx.fillRect(
                    x - half + 2,
                    (y - half) + 2 + ((i * (length - 3)) / 100),
                    length - 2,
                    1 + (length - 2) / 100);
                };
        };

        renderInner();
        var updateInner = function(evt) {
            //TODO: Cleanup more?
            var offset = _this._getRelativePos(can, evt);
            var xDiff = Math.abs(x - offset.x);
            var yDiff = Math.abs(y - offset.y);
            var dist = Math.sqrt(Math.pow(x - offset.x, 2) + Math.pow(y - offset.y, 2));
            if (dist < _this.radius - _this.options.ringSize &&
                xDiff < length &&
                yDiff < length) {
                    inner.css({
                        left: evt.pageX -5,
                        top: evt.pageY - 5
                    });
            }
        }
        var updateOuter = function(evt) {
            var rawAngle = Math.atan2(evt.pageY - y, evt.pageX - x), angle = rawAngle * 180 / Math.PI;
            if (rawAngle < 0) {
                angle = 360 - (angle * -1);
            }

            var middle = _this.radius - ((_this.options.ringSize) / 2);
            outer.css({
                left: Math.cos(rawAngle) * middle + x - 10,
                top: Math.sin(rawAngle) * middle + y - 10
            });
            _this.options.color = Math.round(angle);
            renderInner();
        }

        $('#colorwheel, .colorwheel-outer, .colorwheel-inner').on('mousedown', function (evt) {
            evt.preventDefault();
            var parentOffset = can.parent().offset();
            var eX = evt.pageX - parentOffset.left;
            var eY = evt.pageY - parentOffset.top;
            var dist = Math.sqrt(Math.pow(x -eX, 2) + Math.pow(y - eY, 2));
            if (dist < _this.radius && dist > _this.radius - _this.options.ringSize) {
                focusOut = true;
                updateOuter(evt);
            } else if (dist < _this.radius - _this.options.ringSize) {
                focusIn = true;
                updateInner(evt);
            }
        });

        $(document).on('mouseup', function (evt) {
            focusOut = false;
            focusIn = false;
        }).on('mousemove', function (evt) {
            if (focusOut) {
                updateOuter(evt);
            } else if (focusIn) {
                updateInner(evt);
            }
        });
    },

    getColor: function() {
        var c = ctx.getImageData(offset.x, offset.y, 1, 1).data;
        return {'r':c[0], 'g':c[1], 'b':c[2]};
    },

    _getRelativePos: function (element, evt) {
        var parentOffset = $(element).offset();
        var eX = evt.pageX - parentOffset.left;
        var eY = evt.pageY - parentOffset.top;
        return {x: eX, y: eY};
    },

    destroy: function() {
        this.element.children('.colorwheel, .colorwheel-inner, .colorwheel-outer').remove();
    }
});