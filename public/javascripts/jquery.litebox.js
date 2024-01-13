var staticWidth = 767;
var staticHeight = 850;
var liteForm;

function liteboxInitialise(portalUrl, form) {
    $(document).ready(function () {

        if (portalUrl === null || portalUrl === '')
            throw new Error('Required field "portalUrl" not set. Please set the portalUrl.');

        if (form) {
            if ($("#" + form).length)
                liteForm = form;
            else
                throw new Error('Could not locate Form tag with id \'' + form + '\' on page');
        }

        $.fn.center = function (obj) {
            this.css('position', 'fixed');
            this.css('top', '0px');
            this.css('left', (obj.width() / 2 - this.width() / 2) + 'px');
            return this;
        };

        // Get handle to iveri-litebox
        var litebox = document.getElementById('iveri-litebox');
        if (litebox) {
            litebox.setAttribute('class', 'modal fade');
            litebox.setAttribute('data-backdrop', 'static');
            litebox.setAttribute('data-keyboard', 'false');
            var actualWidth = getActualWidth();
            if (staticWidth > actualWidth) {
                litebox.style.height = getFrameHeight() + 'px';
                litebox.style.width = getFrameWidth() + 'px';
            }

            // Create the iveri-litebox-dialog div
            var liteboxDialog = document.createElement('div');
            liteboxDialog.setAttribute('id', 'iveri-litebox-dialog');
            liteboxDialog.setAttribute('class', 'modal-dialog modal-dialog-centered');

            // Append the div to the iveri-litebox
            litebox.appendChild(liteboxDialog);
            if (liteboxDialog) {
                liteboxDialog.style.height = getFrameHeight() + 'px';
                liteboxDialog.style.width = getFrameWidth() + 'px';
                if (staticWidth < actualWidth)
                    $("#iveri-litebox-dialog").center($("#iveri-litebox"));

                // Create the iveri-litebox-content div
                var liteboxContent = document.createElement('div');
                liteboxContent.setAttribute('id', 'iveri-litebox-content');
                liteboxContent.setAttribute('class', 'modal-content');

                // Append the div to the iveri-litebox-dialog
                liteboxDialog.appendChild(liteboxContent);
                if (liteboxContent) {
                    liteboxContent.style.height = getFrameHeight() + 'px';
                    liteboxContent.style.width = getFrameWidth() + 'px';
                    liteboxContent.style.position = 'fixed';

                    // Create the iveri-litebox-iframe iframe
                    var liteboxFrame = document.createElement('iframe');
                    liteboxFrame.setAttribute('src', portalUrl + '/Lite/LiteBox.aspx');
                    liteboxFrame.setAttribute('id', 'iveri-litebox-iframe');
                    liteboxFrame.setAttribute('seamless', 'seamless');
                    liteboxFrame.setAttribute('frameborder', '0');
                    liteboxFrame.setAttribute('height', getFrameHeight());
                    liteboxFrame.setAttribute('width', getFrameWidth());
                    liteboxFrame.onload = function () { };

                    // Append the frame to the iveri-litebox-content
                    liteboxContent.appendChild(liteboxFrame);
                    if (liteboxFrame) {
                        // Get handle to iveri-litebox-button
                        var liteboxButton = document.getElementById('iveri-litebox-button');
                        if (liteboxButton) {
                            liteboxButton.setAttribute('class', 'btn btn-lg btn-primary');
                            liteboxButton.setAttribute('data-toggle', 'modal');
                            liteboxButton.setAttribute('data-target', '#iveri-litebox');

                            //Check browser
                            if (browser() === 'IE') {
                                console.error('Litebox functionality not supported in your browser!...');
                                liteboxButton.style.visibility = 'hidden';
                            }

                            // Send data on modal dialog button click
                            bindEvent(liteboxButton, 'click', function (e) {
                                var form = getFormFields();

                                // Make sure you are sending a string, and to stringify JSON
                                liteboxFrame.contentWindow.postMessage(form, '*');
                            });
                        }

                        // Listen to message from child window
                        bindEvent(window, 'message', function (e) {
                            liteboxComplete(e.data);
                            $('#iveri-litebox').modal('hide');
                        });
                    }
                }
            }
        }
    });
}

// tell merchant which if browser is supported
function isBrowserSupported() {
    if (browser() === 'IE')
        return false;
}

// addEventListener support for IE8
function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

function getAttrs(DOMelement) {
    var obj = {};
    $.each(DOMelement.attributes, function () {
        if (this.specified) {
            obj[this.name] = this.value;
        }
    });
    return obj;
}

// Retrieve the form fields
function getFormFields() {
    var jsonData = '{}';
    if (liteForm === undefined) {
        $("form").each(function () {
            var json = {
                "form": []
            };
            $(this).find("input").each(function () {
                if (isLiteField(this) && nonEmtyField(this)) {
                    json.form.push(getAttrs(this));
                }
            });

            $(this).find("select").each(function () {
                if (isLiteField(this) && nonEmtyField(this)) {
                    var select = getAttrs(this);
                    select["type"] = "select";
                    var options = [];
                    $(this).children().each(function () {
                        options.push(getAttrs(this));
                    });
                    select["options"] = options;
                    json.form.push(select);
                }
            });

            //console.log(json);
            jsonData = json;
        });
    } else {
        $("#" + liteForm).each(function () {
            var json = {
                "form": []
            };
            $(this).find("input").each(function () {
                if (isLiteField(this) && nonEmtyField(this)) {
                    json.form.push(getAttrs(this));
                }
            });

            $(this).find("select").each(function () {
                if (isLiteField(this) && nonEmtyField(this)) {
                    var select = getAttrs(this);
                    select["type"] = "select";
                    var options = [];
                    $(this).children().each(function () {
                        options.push(getAttrs(this));
                    });
                    select["options"] = options;
                    json.form.push(select);
                }
            });

            //console.log(json);
            jsonData = json;
        });
    }
    return JSON.stringify(jsonData);
}

// Returns true only for Lite request fields
function isLiteField(DOMelement) {
    var id = DOMelement.id;
    if (id.startsWith('Lite_') || id.startsWith('Ecom_') || id.startsWith('Airline_') || id.startsWith('MerchantReference'))
        return true;
    else
        return false;
}

// Returns true only for fields that has a value
function nonEmtyField(DOMelement) {
    var value = DOMelement.value;
    if (value === '')
        return false;
    else
        return true;
}

// The width of the iFrame
function getFrameWidth() {
    var actualWidth = getActualWidth();
    if (actualWidth < staticWidth)
        return actualWidth;
    else
        return staticWidth;
}

// The height of the iFrame
function getFrameHeight() {
    var actualHeight = getActualHeight();
    if (actualHeight < staticHeight)
        return actualHeight;
    else
        return staticHeight;
}

function getActualWidth() {
    var actualWidth = window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth ||
        document.body.offsetWidth;
    return actualWidth;
}

function getActualHeight() {
    var actualHeight = window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight ||
        document.body.offsetHeight;
    return actualHeight;
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

/**
 * Gets the browser name or returns an empty string if unknown. 
 * This function also caches the result to provide for any 
 * future calls this function has.
 *
 * @returns {string}
 */
var browser = function () {
    // Return cached result if avalible, else get result then cache it.
    if (browser.prototype._cachedResult)
        return browser.prototype._cachedResult;

    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;

    return browser.prototype._cachedResult =
        isOpera ? 'Opera' :
            isFirefox ? 'Firefox' :
                isSafari ? 'Safari' :
                    isChrome ? 'Chrome' :
                        isIE ? 'IE' :
                            isEdge ? 'Edge' :
                                "Don't know";
};