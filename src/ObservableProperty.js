"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var Subject_1 = require("rxjs/Subject");
var ObservableProperty = /** @class */ (function () {
    function ObservableProperty(url) {
        this.format = 'rdf';
        if (url.indexOf('opengis.net') >= 0) {
            url = 'http://defs.opengis.net/sissvoc/ogc-def/resource.json?uri=' + url;
            this.format = 'json';
        }
        this.url = url;
    }
    ObservableProperty.prototype.retrieveLabel = function () {
        var _this = this;
        var retVal = new Subject_1.Subject();
        axios_1.default.get(this.url)
            .then(function (res) {
            // console.log('res', res.data);
            if (_this.format === 'json') {
                // console.log('json', JSON.stringify(res.result, null, 4));
                _this.label = res.data.result.primaryTopic.definition;
            }
            else if (_this.format === 'rdf') {
                var xmldoc = require('xmldoc');
                var document = new xmldoc.XmlDocument(res.data);
                // console.log('doc 1', document.toString())
                // console.log('doc', JSON.stringify(document, null, 4));
                var prefLabel = document.valueWithPath('skos:Concept.skos:prefLabel');
                // console.log('doc', JSON.stringify(prefLabel, null, 4));
                // console.log('label', prefLabel);
                _this.label = prefLabel;
            }
            _this.originalDocument = res.data;
            retVal.next(_this.label);
        })
            .catch(function (err) {
            console.log('error retrieving label', err);
            retVal.error(err);
        });
        return retVal;
    };
    return ObservableProperty;
}());
exports.ObservableProperty = ObservableProperty;
//# sourceMappingURL=ObservableProperty.js.map