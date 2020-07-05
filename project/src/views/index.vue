<template>
	<div>
		<mainMap></mainMap>
	</div>
</template>

<script>
	import mainMap from "./layer/map.vue";

	export default {
		components: {
			mainMap,
		},

		data() {
			return {

			}
		},

		created() {
			this.log("index created");
		},

		destroyed() {

		},

		methods: {

		}
	}
</script>

<style scoped>

</style>
