/* global  */

(function(countlyVue) {

    /**
     * Container is a simple class that stores objects
     */
    function Container() {
        this.dict = {};
    }

    Container.prototype.registerData = function(id, value) {
        if (!Object.prototype.hasOwnProperty.call(this.dict, id)) {
            this.dict[id] = {};
        }

        if (!Object.prototype.hasOwnProperty.call(this.dict[id], "data")) {
            this.dict[id].data = [];
        }

        var _items = this.dict[id].data;

        if (!Object.prototype.hasOwnProperty.call(value, 'priority')) {
            _items.push(Object.freeze(value));
        }
        else {
            var found = false,
                i = 0;

            while (!found && i < _items.length) {
                if (!Object.prototype.hasOwnProperty.call(_items[i], 'priority') || _items[i].priority > value.priority) {
                    found = true;
                }
                else {
                    i++;
                }
            }
            _items.splice(i, 0, value);
        }
    };

    Container.prototype.registerTab = function(id, tab) {
        if (!Object.prototype.hasOwnProperty.call(this.dict, id)) {
            this.dict[id] = {};
        }

        if (!Object.prototype.hasOwnProperty.call(this.dict[id], "tabs")) {
            this.dict[id].tabs = [];
        }
        tab.priority = tab.priority || 0;
        var putAt = this.dict[id].tabs.length;

        if (tab.priority) {
            for (var zz = 0; zz < this.dict[id].tabs.length; zz++) {
                if (this.dict[id].tabs[zz].priority && this.dict[id].tabs[zz].priority > tab.priority) {
                    putAt = zz;
                    break;
                }
            }
        }
        this.dict[id].tabs.splice(putAt, 0, tab);
    };

    Container.prototype.registerMixin = function(id, mixin) {
        if (!Object.prototype.hasOwnProperty.call(this.dict, id)) {
            this.dict[id] = {};
        }

        if (!Object.prototype.hasOwnProperty.call(this.dict[id], "mixins")) {
            this.dict[id].mixins = [];
        }

        this.dict[id].mixins.push(mixin);
    };

    Container.prototype.registerTemplate = function(id, path) {
        if (!Object.prototype.hasOwnProperty.call(this.dict, id)) {
            this.dict[id] = {};
        }
        if (!Object.prototype.hasOwnProperty.call(this.dict[id], "templates")) {
            this.dict[id].templates = [];
        }
        if (Array.isArray(path)) {
            this.dict[id].templates = this.dict[id].templates.concat(path);
        }
        else {
            this.dict[id].templates.push(path);
        }
    };

    Container.prototype.dataMixin = function(mapping) {
        var self = this;
        var mixin = {
            data: function() {
                return Object.keys(mapping).reduce(function(acc, val) {
                    acc[val] = self.dict[mapping[val]] ? self.dict[mapping[val]].data : [];
                    return acc;
                }, {});
            }
        };
        return mixin;
    };

    Container.prototype.tabsMixin = function(mapping) {
        var self = this;
        var mixin = {
            data: function() {
                return Object.keys(mapping).reduce(function(acc, val) {
                    acc[val] = self.dict[mapping[val]] ? self.dict[mapping[val]].tabs : [];
                    return acc;
                }, {});
            }
        };
        return mixin;
    };

    Container.prototype.mixins = function(ids) {
        var self = this;
        var mixins = [];

        ids.forEach(function(id) {
            var mix = self.dict[id] ? self.dict[id].mixins : [];
            mixins = mixins.concat(mix);
        });

        return mixins;
    };

    Container.prototype.templates = function(ids) {
        var self = this;
        var templates = [];
        ids.forEach(function(id) {
            var template = self.dict[id] ? self.dict[id].templates : [];
            templates = templates.concat(template);
        });
        return templates;
    };

    Container.prototype.tabsVuex = function(ids) {
        var self = this;
        var vuex = [];

        ids.forEach(function(id) {
            var tabs = self.dict[id] ? self.dict[id].tabs : [];

            tabs.forEach(function(t) {
                if (t.vuex) {
                    vuex = vuex.concat(t.vuex);
                }
            });
        });


        return vuex;
    };

    countlyVue.container = new Container();

}(window.countlyVue = window.countlyVue || {}));
