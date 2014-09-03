var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(function(require, exports, module) {
  var Task, Tasks;
  module.exports = Tasks;
  Task = require("./Task");
  return Tasks = (function(_super) {

    __extends(Tasks, _super);

    Tasks.prototype.events = {
      "change   input[type=checkbox]": "toggle",
      "click    .destroy": "remove",
      "dblclick .view": "edit",
      "keypress input[type=text]": "blurOnEnter",
      "blur     input[type=text]": "close"
    };

    Tasks.prototype.elements = {
      "input[type=text]": "input"
    };

    function Tasks() {
      this.render = __bind(this.render, this);
      Tasks.__super__.constructor.apply(this, arguments);
      this.item.bind("update", this.render);
      this.item.bind("destroy", this.destroy);
    }

    Tasks.prototype.render = function() {

    var jjj = '<div class="item {{if done}}done{{/if}}">' +
      '<div class="view" title="Double click to edit...">' +
        '<input type="checkbox" {{if done}}checked="checked"{{/if}}>' +
        '<span>${name}</span> <a class="destroy"></a>' +
      '</div>' +
'{{if test}}' +
'{{each test}}' +
  '{{if $value.value == name}}' +
  '<a href="#">AAA</a>' +
  '{{/if}}' +
  '<a href="#">${$value.value}</a>' +
'{{/each}}' +
'{{/if}}' +
      '<div class="edit">' +
        '<span> ${happy.name} </span>' +
        '<input type="text" value="${name}">' +
      '</div>' +
    '</div>';
      this.replace($(jjj).tmpl(this.item));

      //this.replace($("#taskTemplate").tmpl(this.item));
      return this;
    };

    Tasks.prototype.toggle = function() {
      this.item.done = !this.item.done;
      return this.item.save();
    };

    Tasks.prototype.remove = function() {
      return this.item.destroy();
    };

    Tasks.prototype.edit = function() {
      this.el.addClass("editing");
      return this.input.focus();
    };

    Tasks.prototype.blurOnEnter = function(e) {
      if (e.keyCode === 13) {
        return e.target.blur();
      }
    };

    Tasks.prototype.close = function() {
      this.el.removeClass("editing");
      return this.item.updateAttributes({
        name: this.input.val()
      });
    };

    return Tasks;

  })(Spine.Controller);
});
