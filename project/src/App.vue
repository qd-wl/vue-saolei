<template>
	<div id="app">
		<index />
	</div>
</template>

<script>
	import index from './views/index.vue'

	export default {
		name: 'App',
		components: {
			index
		}
	}
</script>

<style>
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
		margin-top: 10px;
		margin-bottom: 10px;
	}

	body {
		margin: 0;
		padding: 0;
		font-size: 14px;
		-webkit-text-size-adjust: none;
		-webkit-tap-highlight-color: transparent;
		background: rgb(255, 250, 232);
	}

	* {
		box-sizing: border-box;
	}
</style>
