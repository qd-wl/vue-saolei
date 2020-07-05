import Vue from 'vue'
import App from './App.vue'

import Data from './js/Data.js';

Vue.prototype.log = function() {
	if (process.env.NODE_ENV === 'development') {
		console.log(...arguments);
	}
}

Vue.prototype.Data = Data;

new Vue({
	render: h => h(App),
}).$mount('#app')
