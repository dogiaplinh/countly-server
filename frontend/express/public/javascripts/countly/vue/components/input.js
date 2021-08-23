/* global Vue, CV */

(function(countlyVue) {

    var _mixins = countlyVue.mixins;
    var HEX_COLOR_REGEX = new RegExp('^#([0-9a-f]{3}|[0-9a-f]{6})$', 'i');

    Vue.component("cly-colorpicker", countlyVue.components.BaseComponent.extend({
        mixins: [
            _mixins.i18n
        ],
        props: {
            value: {type: [String, Object], default: "#FFFFFF"},
            resetValue: { type: [String, Object], default: "#FFFFFF"}
        },
        data: function() {
            return {
                isOpened: false
            };
        },
        computed: {
            previewStyle: function() {
                return {
                    "background-color": this.value
                };
            },
            localValue: {
                get: function() {
                    return this.value.replace("#", "");
                },
                set: function(value) {
                    var colorValue = "#" + value.replace("#", "");
                    if (colorValue.match(HEX_COLOR_REGEX)) {
                        this.setColor({hex: colorValue});
                    }
                }
            }
        },
        methods: {
            setColor: function(color) {
                this.$emit("input", color.hex);
            },
            reset: function() {
                this.setColor({hex: this.resetValue});
            },
            open: function() {
                this.isOpened = true;
            },
            close: function() {
                this.isOpened = false;
            }
        },
        components: {
            picker: window.VueColor.Sketch
        },
        template: '<div class="cly-vue-colorpicker">\n' +
                        '<div @click.stop="open">\n' +
                            '<div class="preview-box" :style="previewStyle"></div>\n' +
                            '<input class="preview-input" type="text" v-model="localValue" />\n' +
                        '</div>\n' +
                        '<div class="picker-body" v-if="isOpened" v-click-outside="close">\n' +
                            '<picker :preset-colors="[]" :value="value" @input="setColor"></picker>\n' +
                            '<div class="button-controls">\n' +
                                '<cly-button :label="i18n(\'common.reset\')" @click="reset" skin="light"></cly-button>\n' +
                                '<cly-button :label="i18n(\'common.cancel\')" @click="close" skin="light"></cly-button>\n' +
                                '<cly-button :label="i18n(\'common.confirm\')" @click="close" skin="green"></cly-button>\n' +
                            '</div>\n' +
                        '</div>\n' +
                      '</div>'
    }));

    Vue.component("cly-dropzone", window.vue2Dropzone);

    var AbstractListBox = countlyVue.views.BaseView.extend({
        props: {
            options: {type: Array},
            bordered: {type: Boolean, default: true},
            skin: {
                type: String,
                default: "default",
                required: false,
                validator: function(val) {
                    return val === "default" || val === "jumbo";
                }
            },
            disabled: {type: Boolean, default: false, required: false},
            height: {type: [Number, String], default: 300, required: false},
        },
        methods: {
            navigateOptions: function() {
                if (!this.visible) {
                    this.visible = true;
                }
            },
            handleItemClick: function(option) {
                if (!this.disabled) {
                    this.$emit("input", option.value);
                    this.$emit("change", option.value);
                }
            },
            handleItemHover: function(option) {
                this.hovered = option.value;
            },
            handleBlur: function() {
                this.hovered = this.value;
                this.focused = false;
            },
            handleHover: function() {
                this.focused = true;
            }
        },
        data: function() {
            return {
                hovered: null,
                focused: false,
                scrollCfg: {
                    scrollPanel: {
                        initialScrollX: false,
                    },
                    rail: {
                        gutterOfSide: "0px"
                    },
                    bar: {
                        background: "#A7AEB8",
                        size: "6px",
                        specifyBorderRadius: "3px",
                        keepShow: false
                    }
                }
            };
        },
        computed: {
            topClasses: function() {
                var classes = {
                    "is-focus": this.focused,
                    "cly-vue-listbox--bordered": this.bordered,
                    "cly-vue-listbox--disabled": this.disabled
                };
                classes["cly-vue-listbox--has-" + this.skin + "-skin"] = true;
                return classes;
            },
            wrapperStyle: function() {
                if (this.height !== "auto") {
                    return {
                        'max-height': this.height + "px"
                    };
                }
                return false;
            }
        }
    });

    var SearchableOptionsMixin = {
        props: {
            searchable: {type: Boolean, default: true},
            searchPlaceholder: {type: String, default: 'Search'}
        },
        data: function() {
            return {
                searchQuery: ''
            };
        },
        methods: {
            getMatching: function(options) {
                if (!this.searchQuery || !this.searchable) {
                    return options;
                }
                var self = this;
                var query = self.searchQuery.toLowerCase();
                return options.filter(function(option) {
                    return option.label.toLowerCase().indexOf(query) > -1;
                });
            }
        }
    };

    Vue.component("cly-listbox", AbstractListBox.extend({
        mixins: [SearchableOptionsMixin],
        props: {
            searchable: {type: Boolean, default: false, required: false}, //override the mixin
            value: { type: [String, Number] }
        },
        computed: {
            searchedOptions: function() {
                return this.getMatching(this.options);
            }
        },
        template: '<div\
                    class="cly-vue-listbox"\
                    tabindex="0"\
                    :class="topClasses"\
                    @mouseenter="handleHover"\
                    @mouseleave="handleBlur"\
                    @focus="handleHover"\
                    @blur="handleBlur">\
                    <div class="cly-vue-listbox__header bu-p-3" v-if="searchable">\
                        <form>\
                            <el-input\
                                :disabled="disabled"\
                                autocomplete="off"\
                                v-model="searchQuery"\
                                :placeholder="searchPlaceholder">\
                                <i slot="prefix" class="el-input__icon el-icon-search"></i>\
                            </el-input>\
                        </form>\
                    </div>\
                    <vue-scroll\
                        v-if="searchedOptions.length > 0"\
                        :ops="scrollCfg"\>\
                        <div :style="wrapperStyle" class="cly-vue-listbox__items-wrapper">\
                            <div\
                                tabindex="0"\
                                class="text-medium cly-vue-listbox__item"\
                                :class="{\'selected\': value === option.value, \'hover\': hovered === option.value}"\
                                :key="option.value"\
                                @focus="handleItemHover(option)"\
                                @mouseenter="handleItemHover(option)"\
                                @keyup.enter="handleItemClick(option)"\
                                @click.stop="handleItemClick(option)"\
                                v-for="option in searchedOptions">\
                                <div class="cly-vue-listbox__item-content">\
                                    <div class="bu-level">\
                                        <div class="bu-level-left">\
                                            <div class="cly-vue-listbox__item-prefix">\
                                                <slot name="option-prefix" v-bind="option"></slot>\
                                            </div>\
                                            <div class="cly-vue-listbox__item-label bu-ml-2">{{option.label}}</div>\
                                        </div>\
                                        <div class="bu-level-right">\
                                            <slot class="cly-vue-listbox__item-suffix" name="option-suffix" v-bind="option"></slot>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </vue-scroll>\
                    <div v-else class="cly-vue-listbox__no-data">\
                        {{i18n(\'common.search.no-match-found\')}}\
                    </div>\
                </div>'
    }));

    Vue.component("cly-checklistbox", AbstractListBox.extend({
        props: {
            value: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            sortable: {
                type: Boolean,
                default: false
            }
        },
        data: function() {
            return {
                sortMap: null
            };
        },
        watch: {
            options: {
                immediate: true,
                handler: function(options) {
                    if (this.sortable && !this.sortMap) {
                        this.sortMap = Object.freeze(options.reduce(function(acc, opt, idx) {
                            acc[opt.value] = idx;
                            return acc;
                        }, {}));
                    }
                }
            }
        },
        methods: {
            computeSortedOptions: function() {
                if (!this.sortable || !this.sortMap) {
                    return this.options;
                }
                var sortMap = this.sortMap,
                    wrapped = this.options.map(function(opt, idx) {
                        return { opt: opt, idx: idx, ord: sortMap[opt.value] || 0 };
                    });

                wrapped.sort(function(a, b) {
                    return (a.ord - b.ord) || (a.idx - b.idx);
                });

                return wrapped.map(function(item) {
                    return item.opt;
                });
            }
        },
        computed: {
            innerValue: {
                get: function() {
                    return this.value;
                },
                set: function(newVal) {
                    if (this.disabled) {
                        return;
                    }
                    if (this.sortable && this.sortMap) {
                        var sortMap = this.sortMap,
                            wrapped = newVal.map(function(value, idx) {
                                return { value: value, idx: idx, ord: sortMap[value] || 0 };
                            });

                        wrapped.sort(function(a, b) {
                            return (a.ord - b.ord) || (a.idx - b.idx);
                        });

                        var sorted = wrapped.map(function(item) {
                            return item.value;
                        });
                        this.$emit("input", sorted);
                        this.$emit("change", sorted);
                    }
                    else {
                        this.$emit("input", newVal);
                        this.$emit("change", newVal);
                    }
                }
            },
            sortedOptions: {
                get: function() {
                    return this.computeSortedOptions();
                },
                set: function(sorted) {
                    if (!this.sortable) {
                        return;
                    }
                    this.sortMap = Object.freeze(sorted.reduce(function(acc, opt, idx) {
                        acc[opt.value] = idx;
                        return acc;
                    }, {}));
                    this.innerValue = this.value; // triggers innerValue.set
                    this.$emit('update:options', this.computeSortedOptions());
                }
            }
        },
        template: '<div\
                    class="cly-vue-listbox"\
                    tabindex="0"\
                    :class="topClasses"\
                    @mouseenter="handleHover"\
                    @mouseleave="handleBlur"\
                    @focus="handleHover"\
                    @blur="handleBlur">\
                    <vue-scroll\
                        v-if="options.length > 0"\
                        :ops="scrollCfg"\>\
                        <div :style="wrapperStyle" class="cly-vue-listbox__items-wrapper">\
                            <el-checkbox-group\
                                v-model="innerValue">\
                                <draggable \
                                    handle=".drag-handler"\
                                    v-model="sortedOptions"\
                                    :options="{disabled: !sortable}">\
                                <div\
                                    class="text-medium cly-vue-listbox__item"\
                                    :key="option.value"\
                                    v-for="option in sortedOptions">\
                                    <div v-if="sortable" class="drag-handler"><img src="images/drill/drag-icon.svg" /></div>\
                                    <el-checkbox :label="option.value" :key="option.value">{{option.label}}</el-checkbox>\
                                </div>\
                                </draggable>\
                            </el-checkbox-group>\
                        </div>\
                    </vue-scroll>\
                    <div v-else class="cly-vue-listbox__no-data">\
                        {{i18n(\'common.search.no-match-found\')}}\
                    </div>\
                </div>'
    }));

    var TabbedOptionsMixin = {
        props: {
            options: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            hideDefaultTabs: {type: Boolean, default: false},
            allPlaceholder: {type: String, default: 'All'},
            hideAllOptionsTab: {type: Boolean, default: false}
        },
        data: function() {
            return {
                activeTabId: null
            };
        },
        computed: {
            hasAllOptionsTab: function() {
                if (this.hideAllOptionsTab || this.mode === "multi-check-sortable") {
                    return false;
                }
                return true;
            },
            hasTabs: function() {
                if (!this.options || !this.options.length) {
                    return false;
                }
                return !!this.options[0].options;
            },
            publicTabs: function() {
                if (this.hasTabs && this.hasAllOptionsTab) {
                    var allOptions = {
                        name: "__all",
                        label: this.allPlaceholder,
                        options: this.flatOptions
                    };
                    return [allOptions].concat(this.options);
                }
                else if (this.hasTabs) {
                    return this.options;
                }
                return [{
                    name: "__root",
                    label: "__root",
                    options: this.options
                }];
            },
            flatOptions: function() {
                if (!this.hasTabs || !this.options.length) {
                    return this.options;
                }
                return this.options.reduce(function(items, tab) {
                    return items.concat(tab.options);
                }, []);
            },
            val2tab: function() {
                if (!this.publicTabs.length) {
                    return {};
                }
                return this.publicTabs.reduce(function(items, tab) {
                    tab.options.forEach(function(opt) {
                        items[opt.value] = tab.name;
                    });
                    return items;
                }, {});
            },
            selectedOptions: function() {
                if (!this.flatOptions.length) {
                    return {};
                }
                var self = this;
                if (Array.isArray(this.value)) {
                    return this.flatOptions.filter(function(item) {
                        return self.value.indexOf(item.value) > -1;
                    });
                }
                else {
                    var matching = this.flatOptions.filter(function(item) {
                        return item.value === self.value;
                    });
                    if (matching.length) {
                        return matching[0];
                    }
                }
                return {};
            }
        },
        methods: {
            updateTabFn: function(tabId) {
                this.activeTabId = tabId;
            },
            determineActiveTabId: function() {
                var self = this;
                this.$nextTick(function() {
                    if (!self.hasTabs) {
                        self.activeTabId = "__root";
                    }
                    else if (self.value && self.val2tab[self.value]) {
                        self.activeTabId = self.val2tab[self.value];
                    }
                    else if (this.hasAllOptionsTab) {
                        self.activeTabId = "__all";
                    }
                    else if (!self.activeTabId || self.activeTabId === "__all" || self.activeTabId === "__root") {
                        self.activeTabId = self.publicTabs[0].name;
                    }
                });
            },
        },
        watch: {
            hasAllOptionsTab: function() {
                this.determineActiveTabId();
            }
        }
    };

    Vue.component("cly-select-x", countlyVue.components.create({
        mixins: [TabbedOptionsMixin, SearchableOptionsMixin, _mixins.i18n],
        template: CV.T('/javascripts/countly/vue/templates/selectx.html'),
        props: {
            title: {type: String, default: ''},
            placeholder: {type: String, default: 'Select'},
            value: { type: [String, Number, Array] },
            mode: {type: String, default: 'single-list'}, // multi-check,
            autoCommit: {type: Boolean, default: true},
            disabled: { type: Boolean, default: false},
            width: { type: [Number, Object], default: 400},
            size: {type: String, default: ''},
            adaptiveLength: {type: Boolean, default: false},
            singleOptionSettings: {
                type: Object,
                default: function() {
                    return {
                        hideList: false,
                        autoPick: false
                    };
                },
                required: false
            },
            popClass: {
                type: String,
                required: false
            }
        },
        data: function() {
            return {
                uncommittedValue: null
            };
        },
        computed: {
            popClasses: function() {
                return {
                    "cly-vue-select-x__pop--hidden-tabs": this.hideDefaultTabs || !this.hasTabs,
                    "cly-vue-select-x__pop--has-single-option": this.hasSingleOption
                };
            },
            currentTab: function() {
                var self = this;
                var filtered = this.publicTabs.filter(function(tab) {
                    return self.activeTabId === tab.name;
                });
                if (filtered.length > 0) {
                    return filtered[0];
                }
                return {};
            },
            hasSingleOption: function() {
                return (this.activeTabId !== '__root' &&
                        this.currentTab.options &&
                        this.currentTab.options.length === 1 &&
                        this.singleOptionSettings.hideList);
            },
            showList: function() {
                return !this.hasSingleOption;
            },
            innerValue: {
                get: function() {
                    if (this.uncommittedValue && this.uncommittedValue !== this.value) {
                        return this.uncommittedValue;
                    }
                    return this.value;
                },
                set: function(newVal) {
                    if (this.autoCommit) {
                        this.$emit("input", newVal);
                        this.$emit("change", newVal);
                    }
                    else {
                        this.uncommittedValue = newVal;
                    }
                }
            }
        },
        mounted: function() {
            this.determineActiveTabId();
        },
        methods: {
            handleValueChange: function() {
                if (this.mode === 'single-list' && this.autoCommit) {
                    this.doClose();
                }
            },
            doClose: function() {
                this.determineActiveTabId();
                this.$refs.dropdown.handleClose();
            },
            updateDropdown: function() {
                this.$refs.dropdown.updateDropdown();
            },
            handleDropdownShow: function() {
                this.$forceUpdate();
                this.focusOnSearch();
            },
            focusOnSearch: function() {
                var self = this;
                this.$nextTick(function() {
                    self.$refs.searchBox.focus();
                });
            },
            focusOnTrigger: function() {
                var self = this;
                if (this.$refs.trigger && this.$refs.trigger.focus()) {
                    this.$nextTick(function() {
                        self.$refs.trigger.focus();
                    });
                }
            },
            doCommit: function() {
                if (this.uncommittedValue) {
                    this.$emit("input", this.uncommittedValue);
                    this.$emit("change", this.uncommittedValue);
                    this.uncommittedValue = null;
                }
                this.doClose();
            },
            doDiscard: function() {
                this.uncommittedValue = null;
                this.doClose();
            }
        },
        watch: {
            searchQuery: function() {
                this.updateDropdown();
            },
            activeTabId: function() {
                this.updateDropdown();
                if (this.hasSingleOption && this.singleOptionSettings.autoPick) {
                    this.innerValue = this.currentTab.options[0].value;
                    this.doCommit();
                }
            },
            value: function() {
                this.uncommittedValue = null;
            }
        }
    }));

    Vue.component("cly-check", countlyVue.components.BaseComponent.extend(
        // @vue/component
        {
            props: {
                value: {default: false, type: Boolean},
                label: {type: String, default: ''},
                skin: { default: "switch", type: String},
                disabled: {type: Boolean, default: false}
            },
            computed: {
                topClasses: function() {
                    var classes = [];
                    if (["switch", "tick", "star"].indexOf(this.skin) > -1) {
                        classes.push("check-" + this.skin + "-skin");
                    }
                    else {
                        classes.push("check-switch-skin");
                    }
                    if (this.disabled) {
                        classes.push("disabled");
                    }
                    return classes;
                },
                labelClass: function() {
                    return this.getClass(this.value);
                }
            },
            methods: {
                setValue: function(e) {
                    if (!this.disabled) {
                        this.$emit('input', e);
                    }
                },
                getClass: function(value) {
                    var classes = ["check-label"];
                    if (this.skin === "tick") {
                        classes.push("fa");
                        if (value) {
                            classes.push("fa-check-square");
                        }
                        else {
                            classes.push("fa-square-o");
                        }
                    }
                    else if (this.skin === "star") {
                        classes.push("fa fa-star");
                        if (value) {
                            classes.push("color-yellow-100");
                        }
                        else {
                            classes.push("color-cool-gray-50");
                        }
                    }
                    return classes;
                }
            },
            template: '<div class="cly-vue-check" v-bind:class="topClasses">\n' +
                            '<div class="check-wrapper text-clickable">\n' +
                                '<input type="checkbox" class="check-checkbox" :checked="value">\n' +
                                '<i v-bind:class="labelClass" @click.stop="setValue(!value)"></i>\n' +
                                '<span v-if="label" class="check-text" @click.stop="setValue(!value)">{{label}}</span>\n' +
                            '</div>\n' +
                        '</div>'
        }
    ));

    Vue.component('cly-radio-block', countlyVue.components.BaseComponent.extend({
        props: {
            value: {required: true, default: -1, type: [ String, Number ]},
            items: {
                required: true,
                type: Array,
                default: function() {
                    return [];
                }
            },
            skin: { default: "main", type: String},
            disabled: {type: Boolean, default: false}
        },
        computed: {
            topClasses: function() {
                var classes = [];
                if (["main", "light"].indexOf(this.skin) > -1) {
                    classes.push("radio-" + this.skin + "-skin");
                }
                else {
                    classes.push("radio-main-skin");
                }
                if (this.disabled) {
                    classes.push("disabled");
                }
                return classes;
            }
        },
        methods: {
            setValue: function(e) {
                if (!this.disabled) {
                    this.$emit('input', e);
                }
            }
        },
        template: '<div class="cly-vue-radio-block" v-bind:class="topClasses">\n' +
                             '<div class="radio-wrapper">\n' +
                                '<div @click="setValue(item.value)" v-for="(item, i) in items" :key="i" :class="{\'selected\': value == item.value}" class="radio-button bu-is-flex">\n' +
                                    '<div class="bu-is-flex"><div class="box"></div></div>\n' +
                                    '<div class="bu-is-flex bu-is-flex-direction-column bu-is-justify-content-space-between"><div><span class="text-medium">{{item.label}}</span><span v-if="item.description" class="el-icon-info" style="margin-left:10px" v-tooltip.top-center="item.description"></span></div>\n' +
                                    '<div class="bu-is-flex bu-is-align-items-baseline number">' +
										'<h2>{{item.number}}</h2>' +
										'<div v-if="item.trend == \'u\'" class="trend-up">\n' +
											'<i class="fas fa-arrow-up"></i><span>{{item.trendValue}}</span>\n' +
										'</div>\n' +
										'<div v-if="item.trend == \'d\'" class="trend-down">\n' +
											'<i class="fas fa-arrow-down"></i><span>{{item.trendValue}}</span>\n' +
										'</div>\n' +
									'</div></div>\n' +
                                '</div>\n' +
                            '</div>\n' +
                        '</div>'
    }));
    Vue.component('cly-dynamic-textarea', countlyVue.components.BaseComponent.extend({
        template: '<div contenteditable="true" @input="update" v-html="content"></div>',
        props: ['content'],
        methods: {
            update: function(event) {
                this.$emit('update', event.target.innerText);
            }
        }
    }));

}(window.countlyVue = window.countlyVue || {}));
