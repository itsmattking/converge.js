/**
 * converge.js 0.5 Copyright (c) 2015, Matt King (mking@mking.me)
 * Available via the MIT license.
 * see: https://github.com/mattking17/converge.js for details
 */

/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

(function(e,t){typeof define=="function"&&define.amd?define(t):e.converge=t()})(this,function(){var e,t,n;return function(r){function v(e,t){return h.call(e,t)}function m(e,t){var n,r,i,s,o,u,a,f,c,h,p,v=t&&t.split("/"),m=l.map,g=m&&m["*"]||{};if(e&&e.charAt(0)===".")if(t){v=v.slice(0,v.length-1),e=e.split("/"),o=e.length-1,l.nodeIdCompat&&d.test(e[o])&&(e[o]=e[o].replace(d,"")),e=v.concat(e);for(c=0;c<e.length;c+=1){p=e[c];if(p===".")e.splice(c,1),c-=1;else if(p===".."){if(c===1&&(e[2]===".."||e[0]===".."))break;c>0&&(e.splice(c-1,2),c-=2)}}e=e.join("/")}else e.indexOf("./")===0&&(e=e.substring(2));if((v||g)&&m){n=e.split("/");for(c=n.length;c>0;c-=1){r=n.slice(0,c).join("/");if(v)for(h=v.length;h>0;h-=1){i=m[v.slice(0,h).join("/")];if(i){i=i[r];if(i){s=i,u=c;break}}}if(s)break;!a&&g&&g[r]&&(a=g[r],f=c)}!s&&a&&(s=a,u=f),s&&(n.splice(0,u,s),e=n.join("/"))}return e}function g(e,t){return function(){return s.apply(r,p.call(arguments,0).concat([e,t]))}}function y(e){return function(t){return m(t,e)}}function b(e){return function(t){a[e]=t}}function w(e){if(v(f,e)){var t=f[e];delete f[e],c[e]=!0,i.apply(r,t)}if(!v(a,e)&&!v(c,e))throw new Error("No "+e);return a[e]}function E(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function S(e){return function(){return l&&l.config&&l.config[e]||{}}}var i,s,o,u,a={},f={},l={},c={},h=Object.prototype.hasOwnProperty,p=[].slice,d=/\.js$/;o=function(e,t){var n,r=E(e),i=r[0];return e=r[1],i&&(i=m(i,t),n=w(i)),i?n&&n.normalize?e=n.normalize(e,y(t)):e=m(e,t):(e=m(e,t),r=E(e),i=r[0],e=r[1],i&&(n=w(i))),{f:i?i+"!"+e:e,n:e,pr:i,p:n}},u={require:function(e){return g(e)},exports:function(e){var t=a[e];return typeof t!="undefined"?t:a[e]={}},module:function(e){return{id:e,uri:"",exports:a[e],config:S(e)}}},i=function(e,t,n,i){var s,l,h,p,d,m=[],y=typeof n,E;i=i||e;if(y==="undefined"||y==="function"){t=!t.length&&n.length?["require","exports","module"]:t;for(d=0;d<t.length;d+=1){p=o(t[d],i),l=p.f;if(l==="require")m[d]=u.require(e);else if(l==="exports")m[d]=u.exports(e),E=!0;else if(l==="module")s=m[d]=u.module(e);else if(v(a,l)||v(f,l)||v(c,l))m[d]=w(l);else{if(!p.p)throw new Error(e+" missing "+l);p.p.load(p.n,g(i,!0),b(l),{}),m[d]=a[l]}}h=n?n.apply(a[e],m):undefined;if(e)if(s&&s.exports!==r&&s.exports!==a[e])a[e]=s.exports;else if(h!==r||!E)a[e]=h}else e&&(a[e]=n)},e=t=s=function(e,t,n,a,f){if(typeof e=="string")return u[e]?u[e](t):w(o(e,t).f);if(!e.splice){l=e,l.deps&&s(l.deps,l.callback);if(!t)return;t.splice?(e=t,t=n,n=null):e=r}return t=t||function(){},typeof n=="function"&&(n=a,a=f),a?i(r,e,t,n):setTimeout(function(){i(r,e,t,n)},4),s},s.config=function(e){return s(e)},e._defined=a,n=function(e,t,n){t.splice||(n=t,t=[]),!v(a,e)&&!v(f,e)&&(f[e]=[e,t,n])},n.amd={jQuery:!0}}(),n("../node_modules/almond/almond",function(){}),n("converge/constants",[],function(){var e="transitionend",t="transition-property",n=function(){var n=document.body||document.documentElement,r=n.style,i="transition",s=["Moz","webkit","Webkit","Khtml","O","ms"];if(typeof r[i]=="string"){var o=window.getComputedStyle(n);if(typeof n[t]!="string")for(var u=0;u<s.length;u++)typeof o[s[u]+"TransitionProperty"]=="string"&&(t=s[u]+"TransitionProperty");return!0}i=i.charAt(0).toUpperCase()+i.substr(1);for(var u=0;u<s.length;u++)if(typeof r[s[u]+i]=="string")return e=s[u]+i+"End",t=s[u]+"TransitionProperty",!0;return!1}();return{TRANSITION_EVENT:e,TRANSITION_PROPERTY:t,TRANSITIONABLE:n}}),n("converge/shims",[],function(){return function(){var e=Array.prototype.slice;try{e.call(document.documentElement)}catch(t){Array.prototype.slice=function(t,n){n=typeof n!="undefined"?n:this.length;if(Object.prototype.toString.call(this)==="[object Array]")return e.call(this,t,n);var r,i=[],s,o=this.length,u=t||0;u=u>=0?u:o+u;var a=n?n:o;n<0&&(a=o+n),s=a-u;if(s>0){i=new Array(s);if(this.charAt)for(r=0;r<s;r++)i[r]=this.charAt(u+r);else for(r=0;r<s;r++)i[r]=this[u+r]}return i}}}(),{}}),n("converge/utils",["converge/constants","converge/shims"],function(e){function t(t){var n=[],r=window.getComputedStyle(t)[e.TRANSITION_PROPERTY];if(r){var i=r.split(",");for(var s=0;s<i.length;s++){var o=i[s].replace(/\s+/,"");o!=="all"&&n.push(o)}}return n}function n(n){if(!e.TRANSITIONABLE)return!1;n=n||[];var r=!1;for(var i=0;i<n.length;i++)if(t(n[i]).length){r=!0;break}return r}function r(e,t){e&&t&&(e.classList?e.classList.add(t):e.className=s(e).concat(t).join(" "))}function i(e,t){e&&t&&(e.classList?e.classList.remove(t):e.className=o(s(e),function(e){return e!==t}).join(" "))}function s(e){return e?e.classList?Array.prototype.slice.call(e.classList):e.className.split(/\s+/):[]}function o(e,t){var n=[];for(var r=0;r<e.length;r++)t.call(e[r],e[r])===!0&&n.push(e[r]);return n}function u(e){return o(e,function(e){return e.indexOf("-")===-1})}function a(e,t){for(var n=0;n<e.length;n++)if(t.indexOf(e[n])===-1)return!1;return!0}function f(e,t){for(var n=0;n<t;n++){if(!e||!e.parentNode||e===document.body)break;e=e.parentNode}return e}function l(e,t,n){return f(e,t)===n}function c(e){var t,n=1;for(var r=0;r<e.length;r++){if(!t){t=f(e[r],n);continue}t&&!l(e[r],n,t)&&(t=null,n++,r=0)}return t||document.body}return{findTransitionProperties:t,addClass:r,removeClass:i,classesFrom:s,cleanArray:o,removeNegationClasses:u,isInArray:a,findCommonParent:c,willTransition:n}}),n("converge/preloader",["converge/utils"],function(e){function t(){var t=Array.prototype.slice.call(arguments);this.src=e.cleanArray(t,function(e){return typeof e=="string"}),this.callbacks=[],this.individualCallbacks=[]}return t.prototype.then=function(e){e=e||function(){},this.callbacks.push(e)},t.prototype.thenEach=function(e){e=e||function(){},this.individualCallbacks.push(e)},t.prototype.run=function(){var e=this.src,t=e.length,n=this,r=function(){i(this.originalSrc,this),t--,t<=0&&s()},i=function(e,t){for(var r=0;r<n.individualCallbacks.length;r++)n.individualCallbacks[r](e,t)},s=function(){for(var t=0;t<n.callbacks.length;t++)n.callbacks[t](e)},o=function(e){var t=new window.Image;t.onload=r,t.onerror=r,t.originalSrc=e,t.src=e};if(e.length)for(var u=0;u<e.length;u++)o(e[u]);else s()},t}),n("converge/event-container",[],function(){function e(e){this.nextRun=e.nextRun,this.waitForContinue=!1}return e.prototype.resume=function(){return this.waitForContinue=!1,this.nextRun()},e.prototype.wait=function(){this.waitForContinue=!0},e}),n("converge/root",["converge/utils","converge/constants","converge/event-container"],function(e,t,n){function r(e){return this.processElements(e),this.classes=[],this.callbacks=[],this.timings=[],this}return r.prototype.processElements=function(t){if(typeof t=="string"){var n=document.querySelectorAll(t);n&&n.length===0?(this.els=[],typeof this.deferredEls=="undefined"?this.deferredEls=t:this.deferredEls=null):this.els=Array.prototype.slice.call(n||[])}else this.els=Array.prototype.slice.call(t);this.willTransition=e.willTransition(this.els),this.willTransition&&(this.parent=e.findCommonParent(this.els))},r.prototype.alter=function(){var t=Array.prototype.slice.call(arguments);return this.classes.push(e.cleanArray(t,function(e){return typeof e=="string"})),this},r.prototype.thenEach=function(e){return this},r.prototype.then=function(t){var n=Array.prototype.slice.call(arguments);return this.callbacks.push(e.cleanArray(n,function(e){return typeof e=="function"})),this},r.prototype.stagger=function(e,t){return e=e||0,t=t||0,this.timings.push([e,t]),this},r.prototype.delay=function(e){return e=e||0,this.timings.push([0,e]),this},r.prototype.run=function(r){this.deferredEls&&this.processElements(this.deferredEls),r=r||0;var i=this.classes.length,s=this.parent,o=this.callbacks[r]||[],u=this.classes[r]||[],a=this.timings[r]||[0,0],f=this.els,l=this.els.length,c=this,h=this.willTransition,p=function(){r+1<i?c.run(r+1):v(r+1)},d=new n({nextRun:p}),v=function(e){for(var t=e;t<c.callbacks.length;t++)for(var n=0;n<c.callbacks[t].length;n++)c.callbacks[t][n](d,f)},m=function(){for(var e=0;e<o.length;e++)o[e](d,f);d.waitForContinue||p()},g=function(t){return t.target.fulfilledTransitions||(t.target.fulfilledTransitions=[],t.target.transitionsToFulfill=e.findTransitionProperties(t.target)),t.target.fulfilledTransitions.indexOf(t.propertyName)===-1&&t.target.fulfilledTransitions.push(t.propertyName),t.target.transitionsToFulfill.length===0||t.target.fulfilledTransitions.length>=t.target.transitionsToFulfill.length?(t.target.fulfilledTransitions=[],!0):!1},y=function(n){f.indexOf(n.target)!==-1&&e.isInArray(e.removeNegationClasses(u),e.classesFrom(n.target))&&g(n)&&(l--,l<=0&&(s.removeEventListener(t.TRANSITION_EVENT,y),m()))},b=function(){var t=0,n=function(n){return function(){for(var r=0;r<u.length;r++)u[r].indexOf("-")===0?e.removeClass(n,u[r].slice(1)):e.addClass(n,u[r]);h||(t++,t>=f.length&&!h&&m())}};for(var r=0;r<f.length;r++)window.setTimeout(n(f[r]),r*a[0]+a[1])};return this.willTransition&&s.addEventListener(t.TRANSITION_EVENT,y),window.setTimeout(b,15),null},r}),n("converge/root-wrapper",["converge/preloader","converge/root"],function(e,t){function n(e){return this.chain=[],e&&this.on(e),this}return n.prototype.preload=function(t){return this.chain.push(new e(t)),this},n.prototype.on=function(e){return this.chain.push(new t(e)),this},n.prototype.thenOn=n.prototype.on,n.prototype.currentRoot=function(){return this.chain[this.chain.length-1]},n.prototype.alter=function(){return this.currentRoot().alter.apply(this.currentRoot(),Array.prototype.slice.call(arguments)),this},n.prototype.stagger=function(){return this.currentRoot().stagger.apply(this.currentRoot(),Array.prototype.slice.call(arguments)),this},n.prototype.delay=function(){return this.currentRoot().delay.apply(this.currentRoot(),Array.prototype.slice.call(arguments)),this},n.prototype.then=function(){return this.currentRoot().then.apply(this.currentRoot(),Array.prototype.slice.call(arguments)),this},n.prototype.thenEach=function(){return this.currentRoot().thenEach.apply(this.currentRoot(),Array.prototype.slice.call(arguments)),this},n.prototype.run=function(e){e=e||0;var t=this.chain.length,n=this,r=function(){e+1<t&&n.run(e+1)};this.chain[e].then(r),this.chain[e].run()},n}),n("converge",["converge/root-wrapper"],function(e){return{preload:function(t){var n=new e;return n.preload(t)},on:function(t){return new e(t)}}}),t("converge")});