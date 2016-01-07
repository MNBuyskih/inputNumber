$.fn.InputNumber = function (options) {
    $(this).each(function () {
        new InputNumber(this, options);
    });

    return this;
};

var InputNumber = function (input, options) {
    var $this = this;
    $this.input = $(input).data('InputNumber', $this);
    $this.options = {};

    $this.init = function () {
        $.extend($this.options, InputNumber.defaults, options);
        if (!$this.options.container) $this.options.container = $this.input.closest('div');
        $this.container = $this.options.container;

        $.each(Object.keys(InputNumber.defaults), function (n, key) {
            var op = $this.input.data('input-number-' + key);
            if (typeof op !== 'undefined') {
                if (['min', 'max', 'step'].indexOf(key) >= 0) {
                    op = parseFloat(op);
                }
                if (key == 'float') {
                    if (op === 'true') {
                        op = true;
                    } else if (op === 'false') {
                        op = false;
                    } else {
                        op = !!op;
                    }
                }
                if (key == 'precision') {
                    op = +op;
                }
                $this.options[key] = op;
            }
        });

        $('.minus', $this.container).click(function (e) {
            e.preventDefault();

            $this.decrement();
        });

        $('.plus', $this.container).click(function (e) {
            e.preventDefault();

            $this.increment();
        });

        $this.input.keydown(function (e) {
            var keyCode = e.keyCode, shiftKey = e.shiftKey, ctrlKey = e.ctrlKey;
            if (!(
                (keyCode >= 112 && keyCode <= 123) ||                           // F1 - F12
                (keyCode >= 48 && keyCode <= 57) ||                             // верхний ряд цифр
                (keyCode >= 96 && keyCode <= 105) ||                            // нумпад клавиатура
                (keyCode >= 37 && keyCode <= 40) ||                             // кнопки вверх, вниз, влево, вправо
                (keyCode >= 35 && keyCode <= 36) ||                             // кнопки home и end
                ($this.options.float && (keyCode == 190 || keyCode == 110)) ||  // точка
                (ctrlKey && ([65, 86, 67, 88].indexOf(keyCode) >= 0)) ||        // выделить всё, копировать, вставить, вырезать
                ([8, 9, 46].indexOf(keyCode) >= 0)                              // бекспейс, tab и delete
                )) {

                e.preventDefault();
            }

            if (keyCode == 38) {
                $this.increment(shiftKey ? 10 : 1);
                return false;
            }
            if (keyCode == 40) {
                $this.decrement(shiftKey ? 10 : 1);
                return false;
            }

            if (ctrlKey && keyCode == 86) {
                // если вставили - чистим
                setTimeout(function () {
                    $this.cleanUp();
                }, 1);
            }

            return true;
        });

        $this.input.blur(function () {
            $this.cleanUp();
        });
    };

    $this.value = function (value) {
        if (value === undefined) {
            value = $this.input.val();

            if (value == '') {
                return 0;
            } else if ($this.options.float) {
                return $this.parseFloat(value);
            } else {
                return parseInt(value);
            }
        } else {
            value = $this.normalize(value);
            $this.input.val(value);
            $this.input.trigger('change');
            return $this.value();
        }
    };

    $this.normalize = function (value) {
        if (value == '') return value;

        if (value < $this.options.min) {
            value = $this.options.min;
        } else if ($this.options.max !== 0 && value > $this.options.max) {
            value = $this.options.max;
        }
        if ($this.options.float) value = $this.parseFloat(value);

        return value;
    };

    $this.normalizeValue = function () {
        var value = $this.input.val();
        $this.value(value);
    };

    $this.parseFloat = function (value) {
        value = parseFloat(value);
        var precision = Math.pow(10, $this.options.precision);

        value = value * precision;
        value = Math.round(value);
        value = value / precision;

        return value;
    };

    $this.cleanUp = function () {
        var val = $this.input.val();
        val = val.replace(/[^\d\.]/g, '');
        val = $.trim(val);
        $this.value(val);
    };

    $this.decrement = function (modify) {
        modify = modify == undefined ? 1 : modify - 0;
        var val = $this.value() - ($this.options.step * modify);
        $this.value(val);
    };

    $this.increment = function (modify) {
        modify = modify == undefined ? 1 : modify - 0;
        var val = $this.value() + ($this.options.step * modify);
        $this.value(val);
    };

    $this.clean = function () {
        $this.options.step = 0;
        $this.options.min = 0;
        $this.options.max = 0;
    };

    $this.init();
};

InputNumber.defaults = {
    min: 0,
    max: 0,
    step: 1,
    float: false,
    precision: 2
};

$(document).ready(function () {
    $('input[data-input-number]').InputNumber();
});
