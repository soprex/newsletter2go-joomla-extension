window.addEventListener('load', function () {
    var formUniqueCode = document.getElementById('formUniqueCode').value.trim(),
        widgetPreview = document.getElementById('widgetPreview');

    var picker = jQuery.farbtastic('#colorPicker'),
        widgetStyleConfig = document.getElementById('widgetStyleConfig'),
        widgetSourceCode = document.getElementById('widgetSourceCode'),
        input,
        timer = 0,
        n2gSetUp = function  () {
            if (widgetStyleConfig.textContent === null || widgetStyleConfig.textContent.trim() === "") {
                widgetStyleConfig.textContent = JSON.stringify(n2gConfig, null, 2);
            } else {
                n2gConfig = JSON.parse(widgetStyleConfig.textContent);
            }

            [].forEach.call(document.getElementsByClassName('nl2g-fields'), function (element) {
                var field = element.name.split('.');
                var style = getStyle(field[1], n2gConfig[field[0]]['style']);

                element.value = element.style.backgroundColor = style;
                if (element.value !== '') {
                    element.style.color = picker.RGBToHSL(picker.unpack(element.value))[2] > 0.5 ? '#000' : '#fff';
                }
            });

            n2g('create', formUniqueCode);
            n2g('subscribe:createForm', n2gConfig);

            updateSourceCode();
        };

    function getStyle (field, str) {
        var styleArray = str.split(';');

        for (var i=0; i < styleArray.length; i++){
            var styleField = styleArray[i].split(':');
            if (styleField[0].trim() == field) {
                return styleField[1].trim();
            }
        }
        return '';
    }

    function updateConfig (element) {
        widgetStyleConfig.textContent = '';
        var formPropertyArray = element.name.split('.'),
            property = formPropertyArray[0],
            attribute = 'style',
            cssProperty = formPropertyArray[1],
            cssValue = element.value;

        var styleProperties;
        if (n2gConfig[property][attribute] == '') {
            styleProperties = cssProperty + ':' + cssValue;
        } else {
            styleProperties = updateString(n2gConfig[property][attribute], cssProperty, cssValue);
        }

        n2gConfig[property][attribute] = styleProperties;
        widgetStyleConfig.textContent = JSON.stringify(n2gConfig, null, 2);
    }

    function updateForm () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            document.getElementById('n2g_form').remove();
            n2g('subscribe:createForm', n2gConfig);
        }, 200);

        updateSourceCode();
    }

    function updateSourceCode () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            widgetSourceCode.textContent = '';
            widgetSourceCode.textContent = widgetPreview.firstChild.outerHTML;
        }, 200);

        var responsiveStyle = document.createElement("STYLE");
        var styleText = document.createTextNode("#n2g_container * {box-sizing: border-box;} #n2g_container input.n2g_form_inputs, #n2g_container select {width:100%; height: 2em;}");
        responsiveStyle.appendChild(styleText);
        document.getElementById('n2g_form').appendChild(responsiveStyle);
    }

    function updateString (string, cssProperty, cssValue) {
        if (string.slice(-1) === ';') {
            string = string.substring(0, string.length - 1);
        }
        var stylePropertiesArray = string.split(';'),
            found = false;

        for (var i = 0; i < stylePropertiesArray.length; i++) {
            var trimmedAttr = stylePropertiesArray[i].trim();
            var styleProperty = trimmedAttr.split(':');
            if (styleProperty[0] == cssProperty) {
                stylePropertiesArray[i] = cssProperty + ':' + cssValue;
                found = true;
                break;
            }
        }
        if (!found) {
            stylePropertiesArray[i] = cssProperty + ':' + cssValue; //todo check i
        }
        return stylePropertiesArray.join(';') + ';';
    }

    function show () {
        switch(this.id) {
            case 'btnShowConfig':
                widgetStyleConfig.style.display = 'block';
                widgetPreview.style.display = widgetSourceCode.style.display = 'none';
                break;
            case 'btnShowSource':
                widgetSourceCode.style.display = 'block';
                widgetPreview.style.display = widgetStyleConfig.style.display = 'none';
                break;
            default:
                widgetPreview.style.display = 'block';
                widgetStyleConfig.style.display = widgetSourceCode.style.display = 'none';
        }
        this.className = 'btn-primary btn-nl2go';
        [].forEach.call(jQuery('#'+this.id).siblings(), function(button) {
            button.className = '';
        });
    }

    jQuery('.color-picker').focus(function () {
        input = this;
        picker.linkTo(function () {}).setColor('#000');
        picker.linkTo(function (color) {
            input.style.backgroundColor = color;
            input.style.color = picker.RGBToHSL(picker.unpack(color))[2] > 0.5 ? '#000' : '#fff';
            input.value = color;

            updateConfig(input);
            updateForm();

        }).setColor(input.value);
    }).blur(function () {
        input = this;
        picker.linkTo(function () {}).setColor('#000');
        if (!input.value) {
            input.style.backgroundColor = '';
            input.style.color = '';
        }
        updateConfig(input);
        updateForm();
    });

    if (formUniqueCode !== '') {
        n2gSetUp();

        [].forEach.call(document.getElementById('n2gButtons').children, function (button) {
            button.addEventListener('click', show);
        });

        document.getElementById('colorPicker').addEventListener('click', function () {
            input && input.focus();
        });
    }
});