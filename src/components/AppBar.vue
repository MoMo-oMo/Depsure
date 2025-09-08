<template>
	<v-app-bar
		app
		color="#ffffff"
		theme="light"
		flat
		density="comfortable"
	>
		<v-app-bar-nav-icon color="black" @click="toggle" />
		<v-toolbar-title class="title-black">
			<span class="title-text" :key="current.title">{{ current.title }}</span>
		</v-toolbar-title>
	</v-app-bar>
</template>

<script setup>
	import { useDrawer } from '@/composables/useDrawer'
	import { useNav } from '@/composables/useNav'

	const { toggle } = useDrawer()
	const { current } = useNav()
</script>

<style scoped>
.title-black :deep(.v-toolbar-title__placeholder) {
	color: #000000;
}

.title-text {
	position: relative;
	font-weight: 600;
    border-radius:20px;
	line-height: 1.1;
	padding-bottom: 10px;
	display: inline-block;
}

.title-text::after {
	content: "";
	position: absolute;
	left: 0;
	bottom: 0;
	height: 4px;
	width: 100%;
	background-color: #000000;
	transform: scaleX(0);
	transform-origin: left center;
	animation: underline-in 400ms ease forwards;
}

@keyframes underline-in {
	from { transform: scaleX(0); }
	to { transform: scaleX(1); }
}
</style>