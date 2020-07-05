<template>
	<div class="toast" :class="{'toast-act':toastShow}" v-show="toastShow">
		{{toastText}}
	</div>
</template>

<script>
	export default {
		components: {

		},

		data() {
			return {
				toastShow: false,
				toastText: '',
				mTimer: null,
			}
		},

		created() {
			this.log("toast created");
		},

		destroyed() {

		},

		methods: {
			toast(str) {
				var v = this;
				clearTimeout(this.mTimer);
				v.toastText = str;
				v.toastShow = true;
				this.mTimer = setTimeout(function() {
					v.toastShow = false;
				}, 2000)
			}
		}
	}
</script>

<style>
	.toast {
		position: fixed;
		z-index: 999;
		left: 50%;
		top: 50%;
		transform: translateX(-50%) translateY(-50%);
		text-align: center;
		border-radius: 5px;
		color: #ffffff;
		background: rgba(17, 17, 17, 0.9);
		padding: 10px 15px;
		font-size: 16px;
	}

	.toast-act {
		animation: act 0.5s;
		animation-fill-mode: forwards;
	}

	@keyframes act {
		from {
			opacity: 0;
			/* transform: translateX(-50%) translateY(-50%) scale(0.8); */
		}

		to {
			opacity: 1;
			/* transform: translateX(-50%) translateY(-50%) scale(1); */
		}
	}
</style>
